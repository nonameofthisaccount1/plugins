module.exports = {
    name: 'whois',
    category: 'tools',
    description: 'Get DP and info of a user/group',
    async execute(sock, msg, args) {
        const { remoteJid, quoted } = msg.key;
        
        // Determine target: Mentioned user, quoted message user, or provided number
        let target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                     msg.message?.extendedTextMessage?.contextInfo?.participant || 
                     remoteJid;

        if (args[0]) {
            let num = args[0].replace(/[^0-9]/g, '');
            if (num.length > 8) target = `${num}@s.whatsapp.net`;
        }

        try {
            // Fetch High-Res Profile Picture
            const ppUrl = await sock.profilePictureUrl(target, 'image').catch(() => null);
            
            // Fetch User Status
            const status = await sock.fetchStatus(target).catch(() => ({ status: 'Not Available' }));

            let caption = `👤 *WHOIS INFO*\n\n`;
            caption += `🆔 *JID:* ${target.split('@')[0]}\n`;
            caption += `📝 *Status:* ${status.status || 'No status set'}\n`;
            
            if (ppUrl) {
                await sock.sendMessage(remoteJid, { 
                    image: { url: ppUrl }, 
                    caption: caption 
                }, { quoted: msg });
            } else {
                await sock.sendMessage(remoteJid, { 
                    text: `${caption}\n⚠️ *Note:* Profile picture is private or not set.` 
                }, { quoted: msg });
            }
        } catch (err) {
            await sock.sendMessage(remoteJid, { text: '❌ Error fetching user info.' });
        }
    }
};
