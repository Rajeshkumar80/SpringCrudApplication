import axiosClient from './axiosClient';

const BASE_URL = '/chat';

const ChatService = {
  sendMessage: (message) =>
    axiosClient.post(BASE_URL, { message }),
};

export default ChatService;
