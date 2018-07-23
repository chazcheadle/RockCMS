// Retrieve videos from API with optional filtering.
import Express from 'express';
import api from '../api';

const router = new Express.Router();

router.get('/videos', async (req, res) => {
  const publisher = req.query.publisher ? req.query.publisher : undefined;
  const page = parseInt(req.query.page, 10) ? req.query.page : undefined;
  const size = parseInt(req.query.size, 10) ? req.query.size : undefined;

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');

  const result = {
    pageInfo: null,
    data: null,
  };

  const videos = await api(
    {
      op: 'videoSearch',
      filters:
        {
          publisher,
          type: 'video',
        },
      page,
      size,
    },
  );

  if (videos.data.search.items.length > 0) {
    const videoData = {
      pageInfo: videos.data.search.pagination,
      data: videos.data.search.items,
    };
    res.send({ videoData });
  } else {
    res.send(result);
  }
});

module.exports = router;
