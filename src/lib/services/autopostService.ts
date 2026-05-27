// src/lib/services/autopostService.ts
import { createServiceClient } from '@/lib/supabase/server';

export interface IngestedItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl?: string;
  pillar: string;
  type: 'article' | 'video';
}

export class AutopostService {
  private static supabase = createServiceClient();

  /**
   * Pemicu Utama: Mengambil daftar konten baru, memfilter duplikasi postingan,
   * menghasilkan hook AI, dan mengirimkan ke semua platform media sosial yang aktif.
   */
  public static async triggerAutopostsForNewIngest(items: IngestedItem[]): Promise<void> {
    if (!items || items.length === 0) return;

    console.log(`[Autopost Service] Triggering posts for ${items.length} new items.`);

    for (const item of items) {
      // Tentukan target platform aktif
      const platforms = ['telegram', 'pinterest', 'threads', 'bluesky', 'mastodon', 'reddit', 'discord', 'wordpress'];

      for (const platform of platforms) {
        try {
          // 1. Cek deduplikasi: Pastikan belum pernah diposting ke platform ini
          const { data: alreadyPosted, error: logError } = await this.supabase
            .from('autopost_logs')
            .select('status')
            .eq('content_id', item.id)
            .eq('platform', platform)
            .eq('status', 'success')
            .maybeSingle();

          if (alreadyPosted) {
            console.log(`[Autopost Deduplication] Skip. Content "${item.title}" already posted to ${platform}.`);
            continue;
          }

          // 2. Cek Feature Flags di ENV untuk beberapa platform khusus
          if (platform === 'pinterest' && process.env.NEXT_PUBLIC_FEATURE_PINTEREST_AUTO_PIN !== 'true') {
            await this.logStatus(item, platform, 'skipped', '', '', 'Pinterest Auto-Pin feature flag is disabled');
            continue;
          }
          if (platform === 'threads' && process.env.NEXT_PUBLIC_FEATURE_THREADS_AUTO_POST !== 'true') {
            await this.logStatus(item, platform, 'skipped', '', '', 'Threads Auto-Post feature flag is disabled');
            continue;
          }
          if (platform === 'reddit' && process.env.NEXT_PUBLIC_FEATURE_REDDIT_AUTO_POST !== 'true') {
            await this.logStatus(item, platform, 'skipped', '', '', 'Reddit Auto-Post feature flag is disabled');
            continue;
          }
          if (platform === 'discord' && process.env.NEXT_PUBLIC_FEATURE_DISCORD_AUTO_POST !== 'true') {
            await this.logStatus(item, platform, 'skipped', '', '', 'Discord Auto-Post feature flag is disabled');
            continue;
          }
          if (platform === 'wordpress' && process.env.NEXT_PUBLIC_FEATURE_WORDPRESS_AUTO_POST !== 'true') {
            await this.logStatus(item, platform, 'skipped', '', '', 'WordPress Auto-Post feature flag is disabled');
            continue;
          }

          // 3. Generate Hook dengan AI
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lifebloomhub.vercel.app';
          const contentUrl = item.type === 'article' 
            ? `${appUrl}/en/article/${item.slug}` 
            : `${appUrl}/en/video/${item.slug}`;

          const hookText = await this.generateHooksWithAI(item.title, item.description, contentUrl, platform);

          // 4. Kirim Postingan ke API Platform target
          let postUrl = '';
          let success = false;
          let errorMessage = '';

          switch (platform) {
            case 'telegram':
              success = await this.postToTelegram(hookText, contentUrl);
              postUrl = success ? `https://t.me/lifebloom` : '';
              break;
            case 'pinterest':
              postUrl = await this.postToPinterest(item, hookText, contentUrl);
              success = !!postUrl;
              break;
            case 'threads':
              postUrl = await this.postToThreads(hookText, contentUrl);
              success = !!postUrl;
              break;
            case 'bluesky':
              postUrl = await this.postToBluesky(hookText, contentUrl, item.title, item.description);
              success = !!postUrl;
              break;
            case 'mastodon':
              postUrl = await this.postToMastodon(hookText, contentUrl);
              success = !!postUrl;
              break;
            case 'reddit':
              postUrl = await this.postToReddit(hookText, contentUrl, item.title);
              success = !!postUrl;
              break;
            case 'discord':
              postUrl = await this.postToDiscord(hookText, contentUrl, item.title);
              success = !!postUrl;
              break;
            case 'wordpress':
              postUrl = await this.postToWordPress(hookText, contentUrl, item.title, item.imageUrl);
              success = !!postUrl;
              break;
          }

          // 5. Catat Log ke Database
          if (success) {
            await this.logStatus(item, platform, 'success', hookText, postUrl);
            console.log(`[Autopost Success] Posted "${item.title}" to ${platform}`);
          } else {
            errorMessage = `Failed to post to ${platform} API`;
            await this.logStatus(item, platform, 'failed', hookText, '', errorMessage);
            console.error(`[Autopost Error] Failed posting "${item.title}" to ${platform}`);
          }

        } catch (err: any) {
          console.error(`[Autopost Service Fail] Exception for ${platform}:`, err.message);
          await this.logStatus(item, platform, 'failed', '', '', err.message);
        }
      }
    }
  }

  /**
   * AI Hook Generation: Menghubungi Gemini 2.5 Flash secara langsung menggunakan REST API
   * untuk menghasilkan hook media sosial/forum berkinerja tinggi, padat kata, dan persuasif.
   */
  private static async generateHooksWithAI(
    title: string,
    description: string,
    url: string,
    platform: string
  ): Promise<string> {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      console.warn('[Autopost AI] Missing GEMINI_API_KEY. Using fallback template.');
      return this.fallbackTemplate(title, description, platform);
    }

    let platformInstruction = '';
    switch (platform) {
      case 'pinterest':
        platformInstruction = 'Pinterest format. Write a visual lifestyle caption under 500 characters, warm tone, highly aesthetic, include 5 targeted hashtags (e.g. #decor, #retirement), and a strong CTA to read.';
        break;
      case 'threads':
        platformInstruction = 'Threads (Meta) format. Write a punchy, conversational thread starter under 450 characters. End with an intriguing question that encourages engagement and replies. Do NOT use too many hashtags (max 1).';
        break;
      case 'bluesky':
        platformInstruction = 'Bluesky (AT Protocol) format. Write a crisp, intellectually engaging microblog post under 250 characters. Use exactly 2 relevant niche hashtags. Focus on facts or insights.';
        break;
      case 'mastodon':
        platformInstruction = 'Mastodon format. Write a warm, educational summary under 480 characters. Use bullet points for value propositions and include community-oriented hashtags.';
        break;
      case 'telegram':
        platformInstruction = 'Telegram Channel format. Use rich HTML formatting. Bold the title at the top, add 3 elegant bullet points showing what readers will learn, add suitable emojis, and end with a call to action.';
        break;
      case 'reddit':
        platformInstruction = 'Reddit format. Write a highly organic, discussion-provoking hook under 800 characters. Avoid sounding like an ad. Ask a genuine question to the community based on the article\'s core premise. Keep it conversational.';
        break;
      case 'discord':
        platformInstruction = 'Discord format. Write an engaging community announcement. Use bold text and bullet points. End with a question to prompt chat replies.';
        break;
      case 'wordpress':
        platformInstruction = 'WordPress / Web 2.0 Syndication format. Write a compelling 2-paragraph executive summary or abstract that serves as a syndicated teaser. Encourage readers to click the canonical link for the full story.';
        break;
    }

    const prompt = `You are a professional social media manager and high-conversion copywriter.
Generate an engaging hook/teaser for a new post.
Title: "${title}"
Description: "${description}"
URL: "${url}"

Format instructions:
${platformInstruction}

Rules:
1. ONLY return the final hook text to post. Do NOT include any meta explanation, prefix, or markdown code blocks (e.g. do not wrap in \`\`\`).
2. Make sure the hook fits within the character limits specified.
3. Incorporate the URL gracefully at the end of the text if applicable.`;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 300,
            }
          }),
          signal: AbortSignal.timeout(8000)
        }
      );

      if (res.ok) {
        const data = await res.json();
        const generated = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generated) {
          return generated.trim().replace(/^"|"$/g, ''); // bersihkan tanda kutip pembungkus
        }
      }
    } catch (error: any) {
      console.warn('[Autopost AI] Failed generating AI hook, using fallback:', error.message);
    }

    return this.fallbackTemplate(title, description, platform);
  }

  /**
   * INTEGRASI TELEGRAM BOT API
   */
  private static async postToTelegram(text: string, url: string): Promise<boolean> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (!token || !chatId) {
      console.warn('[Autopost Telegram] Missing Telegram credentials in env. Local dry-run.');
      return true; // Return true as mock success in dry-run
    }

    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `${text}\n\n👉 <a href="${url}">Read more details here</a>`,
          parse_mode: 'HTML',
          disable_web_page_preview: false
        })
      });
      return res.ok;
    } catch (err: any) {
      console.error('[Autopost Telegram Error]:', err.message);
      return false;
    }
  }

  /**
   * INTEGRASI PINTEREST API
   */
  private static async postToPinterest(item: IngestedItem, text: string, url: string): Promise<string> {
    const accessToken = process.env.PINTEREST_ACCESS_TOKEN;
    const boardId = process.env.PINTEREST_BOARD_ID;
    
    if (!accessToken || !boardId || accessToken.includes('your-')) {
      console.warn('[Autopost Pinterest] Missing Pinterest credentials. Local dry-run.');
      return `https://pinterest.com/pin/mock-${item.slug}`;
    }

    try {
      const res = await fetch('https://api.pinterest.com/v5/pins', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          link: url,
          title: item.title.slice(0, 100),
          description: text.slice(0, 500),
          board_id: boardId,
          media_source: {
            source_type: 'image_url',
            url: item.imageUrl || 'https://lifebloomhub.vercel.app/images/branding/brand-logo.png'
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        return data.id ? `https://pinterest.com/pin/${data.id}` : `https://pinterest.com/pin/mock-${item.slug}`;
      } else {
        const errText = await res.text();
        console.error('[Pinterest API Error Response]:', errText);
      }
    } catch (err: any) {
      console.error('[Autopost Pinterest Exception]:', err.message);
    }
    return '';
  }

  /**
   * INTEGRASI THREADS API
   */
  private static async postToThreads(text: string, url: string): Promise<string> {
    const accessToken = process.env.THREADS_ACCESS_TOKEN;
    const userId = process.env.THREADS_USER_ID;

    if (!accessToken || !userId || accessToken.includes('your-')) {
      console.warn('[Autopost Threads] Missing Meta Threads credentials. Local dry-run.');
      return `https://threads.net/post/mock-${Math.random().toString(36).slice(2, 9)}`;
    }

    try {
      // Step 1: Buat Media Container
      const containerRes = await fetch(`https://graph.threads.net/v1.0/${userId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_type: 'TEXT',
          text: `${text}\n\n${url}`,
          access_token: accessToken
        })
      });

      if (!containerRes.ok) {
        const errText = await containerRes.text();
        console.error('[Threads Container Creation failed]:', errText);
        return '';
      }

      const containerData = await containerRes.json();
      const containerId = containerData.id;

      if (!containerId) return '';

      // Step 2: Publikasikan Media
      const publishRes = await fetch(`https://graph.threads.net/v1.0/${userId}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: accessToken
        })
      });

      if (publishRes.ok) {
        const publishData = await publishRes.json();
        return publishData.id ? `https://threads.net/post/${publishData.id}` : `https://threads.net/post/mock`;
      }
    } catch (err: any) {
      console.error('[Autopost Threads Exception]:', err.message);
    }
    return '';
  }

  /**
   * INTEGRASI BLUESKY API (AT Protocol)
   */
  private static async postToBluesky(text: string, url: string, title: string, description: string): Promise<string> {
    const handle = process.env.BLUESKY_HANDLE;
    const password = process.env.BLUESKY_PASSWORD;

    if (!handle || !password || handle.includes('your-')) {
      console.warn('[Autopost Bluesky] Missing Bluesky credentials. Local dry-run.');
      return `https://bsky.app/profile/mock/post/mock`;
    }

    try {
      // Step 1: Buat Session untuk mendapatkan Access JWT & DID
      const sessionRes = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: handle, password })
      });

      if (!sessionRes.ok) {
        console.error('[Bluesky Auth session failed]: HTTP', sessionRes.status);
        return '';
      }

      const session = await sessionRes.json();
      const accessJwt = session.accessJwt;
      const did = session.did;

      if (!accessJwt || !did) return '';

      // Step 2: Kirim Post Record
      const recordRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessJwt}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          repo: did,
          collection: 'app.bsky.feed.post',
          record: {
            $type: 'app.bsky.feed.post',
            text: `${text} ${url}`,
            createdAt: new Date().toISOString(),
            embed: {
              $type: 'app.bsky.embed.external',
              external: {
                uri: url,
                title: title.slice(0, 100),
                description: description.slice(0, 200)
              }
            }
          }
        })
      });

      if (recordRes.ok) {
        const record = await recordRes.json();
        // Format post URL Bluesky: bsky.app/profile/{handle}/post/{rkey}
        const postKey = record.uri?.split('/').pop();
        return postKey ? `https://bsky.app/profile/${handle}/post/${postKey}` : `https://bsky.app/profile/${handle}`;
      }
    } catch (err: any) {
      console.error('[Autopost Bluesky Exception]:', err.message);
    }
    return '';
  }

  /**
   * INTEGRASI MASTODON API
   */
  private static async postToMastodon(text: string, url: string): Promise<string> {
    const accessToken = process.env.MASTODON_ACCESS_TOKEN;
    const apiUrl = process.env.MASTODON_API_URL || 'https://mastodon.social/api/v1/';

    if (!accessToken || accessToken.includes('your-')) {
      console.warn('[Autopost Mastodon] Missing Mastodon credentials. Local dry-run.');
      return `https://mastodon.social/mock-post`;
    }

    try {
      const res = await fetch(`${apiUrl.replace(/\/$/, '')}/statuses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: `${text}\n\nRead more: ${url}`,
          visibility: 'public'
        })
      });

      if (res.ok) {
        const data = await res.json();
        return data.url || `https://mastodon.social/mock-post`;
      }
    } catch (err: any) {
      console.error('[Autopost Mastodon Exception]:', err.message);
    }
    return '';
  }

  /**
   * INTEGRASI REDDIT API
   */
  private static async postToReddit(text: string, url: string, title: string): Promise<string> {
    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;
    const username = process.env.REDDIT_USERNAME;
    const password = process.env.REDDIT_PASSWORD;
    const subreddit = process.env.REDDIT_SUBREDDIT;

    if (!clientId || !clientSecret || !username || !password || !subreddit || clientId.includes('your-')) {
      console.warn('[Autopost Reddit] Missing Reddit credentials. Local dry-run.');
      return `https://reddit.com/r/${subreddit || 'mock'}/comments/mock`;
    }

    try {
      // Step 1: Get Access Token
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const tokenRes = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'LifeBloomHubAutopostBot/1.0'
        },
        body: new URLSearchParams({
          grant_type: 'password',
          username,
          password
        })
      });

      if (!tokenRes.ok) return '';
      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;

      // Step 2: Submit Post
      const postRes = await fetch('https://oauth.reddit.com/api/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'LifeBloomHubAutopostBot/1.0'
        },
        body: new URLSearchParams({
          sr: subreddit,
          kind: 'link', // 'link' or 'self' (text)
          title: title.slice(0, 300),
          url: url,
          text: text
        })
      });

      if (postRes.ok) {
        const postData = await postRes.json();
        const postUrl = postData.json?.data?.url;
        return postUrl || `https://reddit.com/r/${subreddit}/comments/mock`;
      }
    } catch (err: any) {
      console.error('[Autopost Reddit Exception]:', err.message);
    }
    return '';
  }

  /**
   * INTEGRASI DISCORD WEBHOOK
   */
  private static async postToDiscord(text: string, url: string, title: string): Promise<string> {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl || webhookUrl.includes('your-')) {
      console.warn('[Autopost Discord] Missing Discord webhook url. Local dry-run.');
      return `https://discord.com/channels/mock`;
    }

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `${text}\n\n👉 **Read more**: ${url}`,
          username: 'LifeBloom Engine',
          avatar_url: 'https://lifebloomhub.vercel.app/images/branding/brand-logo.png'
        })
      });

      if (res.ok) {
        return `https://discord.com/channels/success-webhook`;
      }
    } catch (err: any) {
      console.error('[Autopost Discord Exception]:', err.message);
    }
    return '';
  }

  /**
   * INTEGRASI WORDPRESS REST API
   */
  private static async postToWordPress(text: string, url: string, title: string, imageUrl?: string): Promise<string> {
    const wpUrl = process.env.WORDPRESS_API_URL;
    const username = process.env.WORDPRESS_USERNAME;
    const appPassword = process.env.WORDPRESS_APP_PASSWORD;

    if (!wpUrl || !username || !appPassword || wpUrl.includes('your-')) {
      console.warn('[Autopost WordPress] Missing WP credentials. Local dry-run.');
      return `https://wordpress.mock/post-mock`;
    }

    try {
      const auth = Buffer.from(`${username}:${appPassword}`).toString('base64');
      const contentHtml = `
        <p>${text.replace(/\n/g, '<br/>')}</p>
        <p><strong><a href="${url}" target="_blank">Read the full article on LifeBloom Hub</a></strong></p>
      `;

      const res = await fetch(`${wpUrl.replace(/\/$/, '')}/wp-json/wp/v2/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title,
          content: contentHtml,
          status: 'publish',
          format: 'standard'
        })
      });

      if (res.ok) {
        const data = await res.json();
        return data.link || `https://wordpress.mock/post-mock`;
      }
    } catch (err: any) {
      console.error('[Autopost WordPress Exception]:', err.message);
    }
    return '';
  }

  /**
   * Catat Log eksekusi status ke database Supabase
   */
  private static async logStatus(
    item: IngestedItem,
    platform: string,
    status: 'success' | 'failed' | 'skipped',
    hookText: string,
    postUrl: string,
    errorMessage = ''
  ): Promise<void> {
    try {
      await this.supabase
        .from('autopost_logs')
        .insert({
          content_type: item.type,
          content_id: item.id,
          platform,
          status,
          hook_text: hookText || null,
          post_url: postUrl || null,
          error_message: errorMessage || null
        });
    } catch (err: any) {
      console.error('[Autopost Logger DB Fail]:', err.message);
    }
  }

  /**
   * Fallback Template jika Gemini API down atau key kosong
   */
  private static fallbackTemplate(title: string, description: string, platform: string): string {
    const teaser = description.slice(0, 150) + '...';
    if (platform === 'telegram') {
      return `<b>🌟 NEW PUBLICATION: ${title}</b>\n\n${teaser}`;
    }
    if (platform === 'reddit' || platform === 'discord') {
      return `Have you seen this? ${title}\n\n${teaser}`;
    }
    return `New ${platform === 'pinterest' ? 'Pin' : 'Post'}: ${title}\n\n${teaser}`;
  }
}
