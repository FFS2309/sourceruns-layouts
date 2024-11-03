import type { AxiosInstance } from 'axios';
import type NodeCG from '@nodecg/types';
import type { AllBids, AllPrizes, Configschema, Milestones } from 'types/schemas';
import { generateUserAgent } from '../helpers/GenerateUserAgent';
import axios, { isAxiosError } from 'axios';
import cookie from "cookie";

interface TiltifyCampaignResponse {
    data: {
        id: string
        amount_raised: {
            currency: string
            value: string
        }
        total_amount_raised: {
            currency: string
            value: string
        }
        goal: {
            "value": string,
            "currency": string
        },
        "original_goal": {
            "value": string,
            "currency": string
        }
    }
}

interface TiltifyMilestone {
    active: boolean
    amount: {
        currency: string
        value: string
    }
    name: string
    id: string
    legacy_id: number
}

interface TiltifyMilestonesResponse {
    data: TiltifyMilestone[];
}

interface TiltifyTokenResponse {
    access_token: string
    created_at: string
    expires_in: number
    refresh_token: string
    scope: string
    token_type: string
}

export class TiltifyClient {
    private readonly axios: AxiosInstance;
    private readonly logger: NodeCG.Logger;
    private readonly clientId?: string;
    private readonly clientSecret?: string;
    private readonly user?: string;
    private readonly campaign?: string;
    private token?: string;
    private campaignId?: string;

    constructor(nodecg: NodeCG.ServerAPI<Configschema>) {
        if (!TiltifyClient.hasRequiredTrackerConfig(nodecg)) {
            throw new Error('Tiltify tracker config is missing');
        }

        this.clientId = nodecg.bundleConfig.tiltify!.clientId;
        this.clientSecret = nodecg.bundleConfig.tiltify!.clientSecret;
        this.user = nodecg.bundleConfig.tiltify!.user;
        this.campaign = nodecg.bundleConfig.tiltify!.campaign;
        this.logger = new nodecg.Logger('TiltifyClient');
        this.axios = axios.create({
            baseURL: 'https://v5api.tiltify.com',
            headers: {
                'User-Agent': generateUserAgent(nodecg),
                Accept: 'application/json',
                "Content-Type": "application/json"
            }
        });
        this.axios.interceptors.request.use(config => {
            if (this.token != null) {
                config.headers.set('Authorization', `Bearer ${this.token}`);
            }
            return config;
        });
    }

    async getDonationTotal(): Promise<number> {
        const donationTotalResponse = await this.axios.get<TiltifyCampaignResponse>(`/api/public/campaigns/by/slugs/${this.user}/${this.campaign}`);
        this.campaignId = donationTotalResponse.data.data.id;
        return parseFloat(donationTotalResponse.data.data.amount_raised.value); //double data because Tiltify wraps the response into a data object for some reason
    }

    async getGoal(): Promise<Milestones> {
        const donationTotalResponse = await this.axios.get<TiltifyCampaignResponse>(`/api/public/campaigns/by/slugs/${this.user}/${this.campaign}`);
        return [{
            id: 0,
            start: 0,
            amount: parseFloat(donationTotalResponse.data.data.goal.value), //double data because Tiltify wraps the response into a data object for some reason
            name: "Donation Goal"
        }];
    }

    async getMilestones(): Promise<Milestones> {
        const milestonesResponse = await this.axios.get<TiltifyMilestonesResponse>(`/api/public/campaigns/${this.campaignId}/milestones`);
        const milestones = milestonesResponse.data.data.map(milestone => ({
            id: milestone.legacy_id,
            start: milestone.active ? 0 : parseFloat(milestone.amount.value),
            amount: parseFloat(milestone.amount.value),
            name: milestone.name
        }));
        const goals = await this.getGoal();
        goals.forEach(goal => {milestones.push(goal)});
        return milestones;
    }

    async getToken(): Promise<TiltifyTokenResponse> {
        this.token = undefined;
        const tokenResponse = await this.axios.post<TiltifyTokenResponse>(`/oauth/token`, {client_id: this.clientId, client_secret: this.clientSecret, grant_type: "client_credentials", scope: "public"});
        this.token = tokenResponse.data.access_token;
        return tokenResponse.data;
    }

    static hasRequiredTrackerConfig(nodecg: NodeCG.ServerAPI<Configschema>): boolean {
        const trackerConfig = nodecg.bundleConfig.tiltify;
        if (trackerConfig == null) return false;
        return [
            trackerConfig.clientId,
            trackerConfig.clientSecret,
            trackerConfig.campaign,
            trackerConfig.user
        ].every(configItem => configItem != null);
    }
}
