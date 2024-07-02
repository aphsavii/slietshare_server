const Notification = (to = "", type = "", read = false, timestamp = Date.now()) => {
  return {
    to,
    type,
    read,
    timestamp,
  };
}

export { Notification };