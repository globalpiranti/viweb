const reconnecting = () => {
  let trying = true;
  let interval: Timer | undefined = undefined;
  let firstConnect = true;

  return {
    isFirstConnect: () => firstConnect,
    isTrying: () => trying,
    stop: () => {
      firstConnect = false;
      trying = false;
      if (interval) clearInterval(interval);
    },
    start: () => {
      trying = true;
      interval = setInterval(() => {
        connect();
      }, 5000);
    },
  };
};

const reconnect = reconnecting();

const connect = () => {
  const socket = new WebSocket("/ws");

  socket.addEventListener("open", () => {
    if (!reconnect.isFirstConnect()) location.reload();
    reconnect.stop();
  });

  socket.addEventListener("message", () => {
    location.reload();
  });

  socket.addEventListener("close", () => {
    if (!reconnect.isTrying()) reconnect.start();
  });
};

connect();
