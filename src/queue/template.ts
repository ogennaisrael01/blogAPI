

export function getnewsLetterBody(link: string, authorFullName: string, blogTitle: string, subscriberName: string, unsubscribe: string) {
    const emailHtmlBody = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #1a73e8; margin-top: 0;">New Post From Your Favorite Author!</h2>
        <p>Hello ${subscriberName},</p>
        <p>We are exciting to let you know that <strong>${authorFullName}</strong> has just published a brand new article on their newsletter feed.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #1a73e8; margin: 20px 0; border-radius: 4px;">
            <h3 style="margin: 0 0 10px 0; color: #111;">${blogTitle}</h3>
            <p style="margin: 0; color: #555;">By ${authorFullName}</p>
        </div>

        <p>Click the action button below to read the complete article and join the discussion:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" target="_blank" style="background-color: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">Read Full Blog Post</a>
        </div>

        <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #777; text-align: center;">
            You received this message because you are a verified subscriber to ${authorFullName}'s mailing list.<br/>
            <a href="${unsubscribe}" style="color: #777;">Unsubscribe from these alerts</a>
        </p>
        </div>
    `;
    return emailHtmlBody

}