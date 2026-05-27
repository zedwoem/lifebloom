import { secureLogger } from '@/lib/utils/secureLogger';
import { createClient } from '@supabase/supabase-js';

export interface AffiliateLinkRequest {
  vendor: string;
  productId: string;
  pillar?: string;
}

export interface AffiliateLinkResponse {
  targetUrl: string;
  linkType: 'affiliate_product' | 'sponsored_placement' | 'editorial_outgoing';
}

export class PartnerizeService {
  static generateLink(request: AffiliateLinkRequest): AffiliateLinkResponse {
    try {
      let targetUrl = request.productId;
      let linkType: AffiliateLinkResponse['linkType'] = 'editorial_outgoing';

      if (request.vendor === 'partnerize' || request.vendor === 'impact') {
        const campaignId = process.env.PARTNERIZE_CAMPAIGN_ID || 'fallback';
        // Construct the link with strict source tracking
        targetUrl = `https://partnerize.com/redirect?cam=${campaignId}&prod=${request.productId}&source=lifebloomhub`;
        linkType = 'affiliate_product';
      } else if (request.vendor === 'chewy') {
        const affiliateTag = process.env.CHEWY_AFFILIATE_ID || 'fallback-chewy';
        targetUrl = `https://www.chewy.com/dp/${request.productId}?utm_source=partner&utm_campaign=${affiliateTag}`;
        linkType = 'affiliate_product';
      } else if (request.vendor === 'amazon') {
         const affiliateTag = process.env.AMAZON_AFFILIATE_ID || 'fallback-amazon';
         targetUrl = `https://www.amazon.com/dp/${request.productId}?tag=${affiliateTag}`;
         linkType = 'affiliate_product';
      } else if (request.vendor === 'b2b') {
         targetUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/affiliate-url-rewrite?vendor=b2b&product_id=${request.productId}`;
         linkType = 'sponsored_placement';
      } else {
        // Editorial fallback - validate domain to prevent open redirect
        const parsedUrl = new URL(request.productId);
        const allowedDomains = ['amazon.com', 'chewy.com', 'travelpayouts.com', 'partnerize.com', 'rescuegroups.org'];
        const isAllowed = allowedDomains.some(domain => parsedUrl.hostname.endsWith(domain));
        
        if (!isAllowed) {
          throw new Error('Domain not in editorial allowlist');
        }
      }

      return { targetUrl, linkType };
    } catch (e: any) {
      secureLogger.error("Failed to generate affiliate link", e);
      throw new Error("AFFILIATE_LINK_GENERATION_FAILED");
    }
  }

  static async logClickAsync(linkType: string, pillar: string, productId: string, targetUrl: string) {
    // Isolated secure DB logging
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!supabaseUrl || !supabaseKey) return;
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase
        .from('affiliate_clicks')
        .insert({
          link_type: linkType,
          pillar: pillar,
          referenced_id: productId,
          target_url: targetUrl,
          user_id: null 
        });
        
      if (error) {
        secureLogger.error("Failed to log affiliate click", error);
      }
    } catch (e) {
      secureLogger.error("Error in logClickAsync", e);
    }
  }
}
