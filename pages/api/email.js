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
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  // another option
  // res.setHeader('Access-Control-Allow-Origin', req.header.origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const email = req.body.email;

  try {
    if(!email) throw new Error('Something went wrong');
    if(!validateEmail(email)) throw new Error('Not a valid email');

    const result = await client.query(q.Create(q.Collection('subscriptions'), { data: { email: email.toLowerCase() }}))
    .catch((err) => {
      throw new Error('Email already exists');
    })

    if(!result) throw new Error('Something went wrong');

    
    return res.status(200).json({})

  } catch(err) {
    return res.status(400).json({err: err.message})
  }
}