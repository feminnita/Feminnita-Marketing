module.exports = {
  apps: [
    {
      name: "feminnita-marketing",
      script: "dist/index.js",
      node_args: "--experimental-vm-modules",
      env: {
        NODE_ENV: "production",
      },
      restart_delay: 3000,
      max_memory_restart: "800M",
    },
  ],
};
