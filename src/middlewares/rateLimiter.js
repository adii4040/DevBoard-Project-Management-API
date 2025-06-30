import { rateLimit } from 'express-rate-limit'

export const apiRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000 , //1hour
    limit: 100,               //100req/hour
    keyGenerator: (req) => req.headers['x-api-key'] || req.ip,  //limit based on the apikey
    message: {
        status: 429,
        message: "Rate limit exceeded for this API key.",
    },
    standardHeaders: true,
    legacyHeaders: false,

})
