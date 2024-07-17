const Notification = (
  to,
  type,
  postId = null,
  read = false,
  timestamp = Date.now(),
) => {
  return {
    to,
    type,
    read,
    timestamp,
    postId,
  };
};

export { Notification };
