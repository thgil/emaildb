import Cors from 'cors'
import { Client as FaunaClient, query as q } from "faunadb"

const client = new FaunaClient({
  secret: process.env.FAUNA_SECRET,
  scheme: "https",
  domain: "db.eu.fauna.com"
})

const validateEmail = (email) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};

export default async function email(req, res) {
  await cors(req, res);

  const email = req.body.email;

  try {
    if(!email) throw new Error('Something went wrong');
    if(!validateEmail(email)) throw new Error('Not a valid email');

    const result = await client.query(q.Create(q.Collection('subscriptions'), { data: { email: email.toLowerCase() }}))
    .catch((err) => {
      throw new Error('Email already exists');
    })

    if(!result) throw new Error('Something went wrong');

    
    return res.status(200).end()

  } catch(err) {
    return res.status(400).json({err: err.message})
  }
}

const cors = initMiddleware(
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  Cors({
    origin: "*",
    methods: ['POST', 'OPTIONS'],
  })
)

function initMiddleware(middleware) {
  return (req, res) =>
    new Promise((resolve, reject) => {
      middleware(req, res, (result) => {
        if (result instanceof Error) {
          return reject(result)
        }
        return resolve(result)
      })
    })
}