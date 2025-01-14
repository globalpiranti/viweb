import axios from "axios";

const client = axios.create({
  baseURL: process.env.STRAPI_URL + "/api",
  headers: {
    Authorization: `Bearer ${process.env.STRAPI_KEY}`,
  },
});

export default client;
