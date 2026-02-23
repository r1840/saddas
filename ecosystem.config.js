module.exports = {
  apps: [
    {
      name: 'cryptovest',
      cwd: '/var/www/cryptovest',
      script: 'npm',
      args: 'start',
      env_file: '.env.local',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
