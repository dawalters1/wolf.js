import axios from 'axios';

export default async (url) => new Promise((resolve, reject) => {
  axios.get(url,
    {
      responseType: 'arraybuffer'
    }
  )
    .then((res) => resolve(Buffer.from(res.data, 'binary')))
    .catch(reject);
});
