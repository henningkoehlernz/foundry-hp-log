Hooks.on('preUpdateActor', (actor, data, options, user_id) => {
    console.log('hp-log', data);
    // extract value along path of fields, which may not exist
    let safely = function(obj, path) {
        let chain = path.split('.');
        while (chain.length > 0) {
            obj = (obj ?? {})[chain[0]];
            chain = chain.slice(1);
        }
        return obj;
    };
    // like ?? but keeps null values
    let any = function(...args) {
        for (let i = 0; i < args.length; i++)
            if (args[i] !== undefined)
                return args[i];
        return undefined;
    };
    // HP are recorded as difference from max in Pathfinder
    let offsetHP = safely(data, 'system.attributes.hp.offset');
    let newTemp = safely(data, 'system.attributes.hp.temp');
    let newNL = safely(data, 'system.attributes.hp.nonlethal');
    // HP & SP are recorded as absolute values in Starfinder
    let newHP = safely(data, 'system.attributes.hp.value');
    let newSP = safely(data, 'system.attributes.sp.value');
    // only create message when hp are updated
    if (any(offsetHP, newTemp, newNL, newHP, newSP) !== undefined) {
        let oldHP = safely(actor, 'system.attributes.hp.value');
        let oldSP = safely(actor, 'system.attributes.sp.value');
        let oldTemp = safely(actor, 'system.attributes.hp.temp');
        let oldNL = safely(actor, 'system.attributes.hp.nonlethal');
        // compute new HP based on max (Pathfinder)
        if (offsetHP !== undefined)
            newHP = safely(actor, 'system.attributes.hp.max') + offsetHP;
        // create message
        var hpFormat = function(hp, temp, nl) {
            let full = temp ? `${hp}+${temp}` : hp;
            return nl ? `${full}-${nl}` : full;
        };
        let msg = `hp: ${hpFormat(oldHP, oldTemp, oldNL)} -> ${hpFormat(any(newHP, oldHP), any(newTemp, oldTemp), any(newNL, oldNL))}`;
        if (oldSP !== undefined) { // Starfinder only
            msg += `<br>sp: ${oldSP} -> ${any(newSP, oldSP)}`;
        }
        // Starships record HP the same as characters, shields are stored in quadrants
        if (safely(data, 'system.quadrants') !== undefined) {
            const quadrants = ['forward', 'port', 'starboard', 'aft'];
            let newShields = quadrants.map((q) => safely(data, `system.quadrants.${q}.shields.value`));
            let oldShields = quadrants.map((q) => safely(actor, `system.quadrants.${q}.shields.value`));
            msg += `<br>sp: ${oldShields} -> ${newShields}`;
            // Starfinder trigger updates containing HP fields on sheet closure
            if (oldHP == newHP && oldShields.toString() == newShields.toString())
                return;
        } else {
            // Starfinder trigger updates containing HP fields on sheet closure
            if (oldSP == newSP && oldHP == newHP && oldTemp == newTemp)
                return;
            // show skulls if dead (Pathfinder 1e)
            if (newHP <= safely(actor, "system.abilities.con.total"))
                msg += '<img src="icons/svg/skull.svg" width="50" height="50">';
        }
        // wisper to self and GM
        ChatMessage.create({
            user: user_id,
            speaker: ChatMessage.getSpeaker({actor:actor}),
            content: msg,
            lang: "common", // for use with Polyglot module
            whisper: game.users.filter(u => u.isGM || u.isSelf || actor.testUserPermission(u, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER))
        });
    }
});
