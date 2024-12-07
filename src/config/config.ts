interface Config {
    API_URL: string;
  }
  
  const CONFIG: Config = {
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  };
  
  export default CONFIG;
  