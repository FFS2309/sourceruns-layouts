import type { AxiosInstance } from 'axios';
import type NodeCG from '@nodecg/types';
import type { AllBids, AllPrizes, Configschema, Milestones } from 'types/schemas';
import { generateUserAgent } from '../helpers/GenerateUserAgent';
import axios, { isAxiosError } from 'axios';

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

interface TiltifyPollOption {
    amount_raised: {
        currency: string
        value: string
    }
    id: string
    legacy_id: number
    name: string
}

interface TiltifyPoll {
    active: boolean
    amount_raised: {
        currency: string
        value: string
    }
    id: string
    name: string
    legacy_id: number
    options: TiltifyPollOption[]
}

interface TiltifyPollResponse {
    data: TiltifyPoll[];
}

interface TiltifyTarget {
    "active": boolean,
    "id": string,
    "name": string,
    amount: {
        "value": string,
        "currency": string
    },
    amount_raised: {
        value: string
        "currency": string
    }
    "legacy_id": number
}

interface TiltifyTargetResponse {
    data: TiltifyTarget[];
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

	async getBids(current: boolean): Promise<AllBids>{
        const pollsResponse = await this.axios.get<TiltifyPollResponse>(`/api/public/campaigns/${this.campaignId}/polls`);
        const targetsResponse = await this.axios.get<TiltifyTargetResponse>(`/api/public/campaigns/${this.campaignId}/targets`);
        const bids: AllBids = [];
        pollsResponse.data.data.forEach((poll) => {
                const formattedBid: AllBids[number] = {
                    id: poll.legacy_id,
                    name: poll.name,
                    total: parseFloat(poll.amount_raised.value),
                    state: poll.active ? "OPENED" : "CLOSED"
                }
                formattedBid.options = [];
                poll.options.forEach((option) => {
                    formattedBid.options?.push({
                        id: option.legacy_id,
                        name: option.name,
                        total: parseFloat(option.amount_raised.value)
                    })
                });
                bids.push(formattedBid);
        });

        targetsResponse.data.data.forEach((bid) => {
            const formattedBid: AllBids[number] = {
                id: bid.legacy_id,
                name: bid.name,
                goal: parseFloat(bid.amount.value),
                total: parseFloat(bid.amount_raised.value),
                state: bid.active ? "OPENED" : "CLOSED"
            }
            bids.push(formattedBid);
        });

        return bids;
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
