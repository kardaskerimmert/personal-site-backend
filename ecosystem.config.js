module.exports = {
  apps: [{
    name: 'personal-site-backend',
    script: './dist/server.js',
    
    // Cluster mode ile birden fazla instance
    instances: process.env.NODE_ENV === 'production' ? 2 : 1,
    exec_mode: 'cluster',
    
    // Otomatik restart ayarları
    watch: false,
    max_memory_restart: '500M',
    
    env: {
      NODE_ENV: 'development',
      PORT: 4000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    
    // Logging
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Restart settings
    min_uptime: '10s',
    max_restarts: 10,
    autorestart: true,
    
    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 3000,
    shutdown_with_message: true
  }]
};