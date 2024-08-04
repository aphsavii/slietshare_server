 const Message = ({ content, to, sender, timestamp }) => {
  const messageId = `${sender.regno}-${timestamp}`;
  return {
    'to': to,
    'sender': sender,
    'content': content,
    'isRead': false,
    'timestamp': timestamp,
    'messageId': messageId,
  };
};

export { Message };