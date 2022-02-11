Hooks.on('preUpdateActor', (actor, data, options, user_id) => {
    let newHP = data.data.attributes.hp.value;
    // only create message when hp are updated
    if (newHP) {
        let oldHP = actor.data.data.attributes.hp.value;
        let msg = `hp: ${oldHP} -> ${newHP}`;
        // show skulls if dead
        if (newHP <= -actor.data.data.abilities.con.total) {
            let img = '<img src="icons/svg/skull.svg" width="20" height="20" style="vertical-align: middle;border-style: none;margin-left: 20px;margin-right:20px">';
            msg = img + msg + img;
        }
        // wisper to self and GM
        ChatMessage.create({
            user: user_id,
            speaker: ChatMessage.getSpeaker({actor:actor}),
            content: `<table><th style="text-align:center">${msg}</th></table>`,
            type: CONST.CHAT_MESSAGE_TYPES.WHISPER,
            whisper: game.users.filter(u => u.isGM || u.isSelf)
        });
    }
});
