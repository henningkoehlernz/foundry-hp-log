Hooks.on('preUpdateActor', (actor, data, options, user_id) => {
    // extract value along path of fields, which may not exist
    let safely = function(obj, path) {
        let chain = path.split('.');
        while (chain.length > 0) {
            obj = (obj ?? {})[chain[0]];
            chain = chain.slice(1);
        }
        return obj;
    };
    let newHP = safely(data, 'system.attributes.hp.value');
    let newTemp = safely(data, 'system.attributes.hp.temp');
    let newNL = safely(data, 'system.attributes.hp.nonlethal');
    // stamina points (starfinder)
    let newSP = safely(data, 'system.attributes.sp.value');
    // only create message when hp are updated
    if (newHP !== undefined || newTemp !== undefined || newNL !== undefined || newSP !== undefined) {
        let oldHP = safely(actor, 'system.attributes.hp.value');
        let oldTemp = safely(actor, 'system.attributes.hp.temp');
        let oldNL = safely(actor, 'system.attributes.hp.nonlethal');
        let oldSP = safely(actor, 'system.attributes.sp.value');
        // makes sure new values are defined
        if (newHP === undefined)
            newHP = oldHP;
        if (newTemp === undefined)
            newTemp = oldTemp;
        if (newNL === undefined)
            newNL = oldNL;
        if (newSP === undefined)
            newSP = oldSP;
        // create message
        var hpFormat = function(hp, temp, nl) {
            let full = temp ? `${hp}+${temp}` : hp;
            return nl ? `${full}-${nl}` : full;
        };
        let msg = `hp: ${hpFormat(oldHP, oldTemp, oldNL)} -> ${hpFormat(newHP, newTemp, newNL)}`;
        if (oldSP !== undefined) // are we using stamina points?
            msg += `<br>sp: ${oldSP} -> ${newSP}`;
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
