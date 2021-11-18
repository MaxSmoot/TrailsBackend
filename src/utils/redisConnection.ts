import redis, { RedisClient } from "redis";
import CreateError from "./createError";
const redisClient = redis.createClient();
/**
 * returns the redis client
 * @return Redis Client
 */
export function getRedisClient() {
  if (!redisClient) {
    throw new CreateError("redis connection not established", 500, false);
  } else {
    return redisClient;
  }
}

redisClient.on("error", (err) => {
  throw new CreateError(err, 500, false);
});

export function delValue(key: string) {
  return new Promise<string | null>((resolve, reject) => {
    if(getRedisClient().del(key, (err, __reply) => {
      if (err) {
        return reject(err);
      }
    })){
      return resolve(null)
    }else{
      return reject(null)
    }
  });
}

/**
 * Looks up value in Redis DB
 * @param key 
 */
export function getValue(key: string) {
  return new Promise<string | null>((resolve, reject) => {
    getRedisClient().get(key, (err, reply) => {
      if (err) {
        reject(err);
        return;
      }
      if (!reply) {
        resolve(null);
        return;
      } else {
        resolve(reply);
        return;
      }
    });
  });
}
/**
 * sets key to value in Redis DB
 * @param key 
 * @param value 
 */
export function setValue(key: string, value: string) {
  return new Promise<boolean>((resolve, reject)=>{
    const redisClient = getRedisClient()
    if(!redisClient.connected){
      reject(new CreateError("Redis Not connected", 500, false));
    }
    //set to expire in 186 days -- the max age of a refresh token
    getRedisClient().set(key, value, 'EX', 60 * 60 * 24 * 186,(err, reply)=>{
      if(err){
        reject(new CreateError(err.message, 500, false));
        return;
      }
      if(!reply){
        reject(new CreateError("Value not set", 500, false));
        return;
      } else {
        resolve(true);
        return;
      }
    })
  })
}
