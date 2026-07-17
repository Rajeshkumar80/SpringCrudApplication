import axios from 'axios';

const BASE_URL = '/api/chat';

const ChatService = {
  sendMessage: (message) =>
    axios.post(BASE_URL, { message }),
};

export default ChatService;
