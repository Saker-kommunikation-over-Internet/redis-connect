import express from "express";
import session from "express-session";
import RedisStore from "connect-redis";
import { createClient } from "redis";
import cookieParser from "cookie-parser";
const app = express();

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});

// Skapar en redis-klient
// Med klienten kan vi interagera med Redis
const redisClient = createClient();
redisClient.connect();

// Redisstore konfigurerar redis att användas med express-session
const redisStore = new RedisStore({
  client: redisClient,
  prefix: "session:",
});

app.use(cookieParser());

app.use(
  session({
    secret: "myUnsafeSecret",
    saveUninitialized: false,
    resave: false,
    store: redisStore, //Här säger vi att all sessionsdata ska lagras i vår redisStore
  })
);

app.get("/", (req, res) => {
  if (!req.session.pageViews) {
    req.session.pageViews = 0;
  }
  req.session.pageViews++;
  console.log(req.cookies);
  res.send(`You have visited the page ${req.session.pageViews} times!`);
});

app.get("/username", async (_req, res) => {
  const username = await redisClient.get("username"); //Hämtar username
  res.send(username);
});

app.post("/username", async (_req, res) => {
  await redisClient.set("username", "kristian123"); //Sätter ett nytt username
  res.send("Username updated");
});

app.delete("/session", (req, res) => {
  req.session.destroy();
  res.send("session destroyed"); //förstör sessionen för att frigöra minne i redis.
});
