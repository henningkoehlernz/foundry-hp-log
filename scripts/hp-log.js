Hooks.on('preUpdateActor', (actor, data, options, user_id) => {
    let newHP = data.data.attributes.hp.value;
    let newTemp = data.data.attributes.hp.temp;
    let newNL = data.data.attributes.hp.nonlethal;
    // only create message when hp are updated
    if (newHP !== undefined || newTemp !== undefined || newNL !== undefined) {
        let oldHP = actor.data.data.attributes.hp.value;
        let oldTemp = actor.data.data.attributes.hp.temp;
        let oldNL = actor.data.data.attributes.hp.nonlethal;
        // makes sure new values are defined
        if (newHP === undefined)
            newHP = oldHP;
        if (newTemp === undefined)
            newTemp = oldTemp;
        if (newNL === undefined)
            newNL = oldNL;
        // create message
        var hpFormat = function(hp, temp, nl) {
            let full = temp ? `${hp}+${temp}` : hp;
            return nl ? `${full}-${nl}` : full;
        };
        let msg = `hp: ${hpFormat(oldHP, oldTemp, oldNL)} -> ${hpFormat(newHP, newTemp, newNL)}`;
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
            lang: "common", // for use with Polyglot module
            type: CONST.CHAT_MESSAGE_TYPES.WHISPER,
            whisper: game.users.filter(u => u.isGM || u.isSelf)
        });
    }
});
