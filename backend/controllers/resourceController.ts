import { Request, Response } from 'express';
import axios from 'axios';
import { redisClient } from '../config/redis';

export const getTrending = async (req: Request, res: Response): Promise<void> => {
  const cacheKey = 'github_trending';
  try {
    let data = await redisClient.get(cacheKey);
    if (data) {
      res.json(JSON.parse(data));
      return;
    }

    // Try to fetch from GitHub API (no auth required for trending)
    let repositories = [];
    try {
      const response = await axios.get('https://api.github.com/search/repositories', {
        params: {
          q: 'stars:>1000 language:javascript',
          sort: 'stars',
          order: 'desc',
          per_page: 10
        },
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'DevHub-App'
        }
      });
      
      repositories = response.data.items.map((repo: any) => ({
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        stars: repo.stargazers_count,
        language: repo.language,
        url: repo.html_url,
        owner: repo.owner.login
      }));
    } catch (apiError) {
      console.log('GitHub API failed, using mock data');
      // Fallback to mock data
      repositories = [
        {
          name: 'react',
          full_name: 'facebook/react',
          description: 'A declarative, efficient, and flexible JavaScript library for building user interfaces.',
          stars: 200000,
          language: 'JavaScript',
          url: 'https://github.com/facebook/react',
          owner: 'facebook'
        },
        {
          name: 'vue',
          full_name: 'vuejs/vue',
          description: 'Vue.js - The Progressive JavaScript Framework',
          stars: 190000,
          language: 'JavaScript',
          url: 'https://github.com/vuejs/vue',
          owner: 'vuejs'
        },
        {
          name: 'angular',
          full_name: 'angular/angular',
          description: 'The modern web developer\'s platform',
          stars: 85000,
          language: 'TypeScript',
          url: 'https://github.com/angular/angular',
          owner: 'angular'
        },
        {
          name: 'svelte',
          full_name: 'sveltejs/svelte',
          description: 'Cybernetically enhanced web apps',
          stars: 70000,
          language: 'JavaScript',
          url: 'https://github.com/sveltejs/svelte',
          owner: 'sveltejs'
        },
        {
          name: 'next.js',
          full_name: 'vercel/next.js',
          description: 'The React Framework for Production',
          stars: 110000,
          language: 'JavaScript',
          url: 'https://github.com/vercel/next.js',
          owner: 'vercel'
        }
      ];
    }
    
    // Cache for 10 minutes
    await redisClient.setEx(cacheKey, 600, JSON.stringify(repositories));
    res.json(repositories);
  } catch (err) {
    console.error('Resource controller error:', err);
    res.status(500).json({ msg: 'API error' });
  }
};

export const getStackOverflowQuestions = async (req: Request, res: Response): Promise<void> => {
  const cacheKey = 'stackoverflow_questions';
  const { tags = 'javascript' } = req.query;
  
  try {
    let data = await redisClient.get(`${cacheKey}:${tags}`);
    if (data) {
      res.json(JSON.parse(data));
      return;
    }

    const response = await axios.get('https://api.stackexchange.com/2.3/questions', {
      params: {
        order: 'desc',
        sort: 'activity',
        tagged: tags,
        site: 'stackoverflow',
        pagesize: 20
      }
    });

    const questions = response.data.items.map((q: any) => ({
      question_id: q.question_id,
      title: q.title,
      tags: q.tags,
      score: q.score,
      view_count: q.view_count,
      answer_count: q.answer_count,
      creation_date: q.creation_date,
      link: q.link,
      owner: q.owner
    }));

    // Cache for 10 minutes
    await redisClient.setEx(`${cacheKey}:${tags}`, 600, JSON.stringify(questions));
    res.json(questions);
  } catch (err) {
    console.error('StackOverflow API error:', err);
    res.status(500).json({ msg: 'API error' });
  }
};