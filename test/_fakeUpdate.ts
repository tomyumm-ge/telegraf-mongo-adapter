import { Update } from "@telegraf/types/update";
import { Chat, User } from "@telegraf/types/manage";

let update_id = 0;
let message_id = 0;

export const fakeUpdate = (id: number): Update.MessageUpdate => {
  const from: User = {
    id,
    is_bot: false,
    first_name: "Lionel",
    last_name: "Messi",
  };

  const chat: Chat.PrivateChat = {
    id: id as number,
    type: "private",
    first_name: "Lionel",
    last_name: "Messi",
  };

  return {
    update_id: update_id++,
    message: {
      message_id: message_id++,
      date: Date.now(),
      from: { ...from },
      chat: { ...chat },
      text: "/start",
      entities: [{ offset: 0, length: 6, type: "bot_command" }],
    },
  };
};
