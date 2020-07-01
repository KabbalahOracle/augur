import { SubscriptionEventName, TXEventName } from '@augurproject/sdk-lite';
import * as _ from 'lodash';
import { Augur } from '../../Augur';
import { AbstractTable } from './AbstractTable';
import { DB } from './DB';

/**
 * Stores Getter results
 */
export class GetterCache extends AbstractTable {
    private augur: Augur;

    private timeToLive = 5 * 60 * 60; // 5 minute cache life. Done as a catch all protective measure

    // Mapping from event name to getters which should be cleared when such an event is received
    eventMapForCacheClearing = {
        [SubscriptionEventName.MarketsUpdated]: [
            "getMarkets",
            "getMarketLiquidityRanking",
            "getMarketOutcomeBestOffer",
            "getMarketsInfo",
            "getPlatformActivityStats",
            "getTotalOnChainFrozenFunds",
        ],
        [TXEventName.Success]: [
            "getAccountRepStakeSummary",
            "getAccountTransactionHistory",
            "getUserCurrentDisputeStake",
            "getUserAccountData",
            "getUserPositionsPlus",
            "getAccountTimeRangedStats",
        ],
        [SubscriptionEventName.ZeroXMeshOrderEvent]: [
            "getMarketPriceHistory",
            "getMarketOrderBook",
            "getUserFrozenFundsBreakdown",
            "getUserAccountData",
            "getUserPositionsPlus",
            "getUserOpenOrders",
            "getAccountTimeRangedStats",
            "getTotalOnChainFrozenFunds",
            "getZeroXOrder",
            "getZeroXOrders",
        ],
        [SubscriptionEventName.MarketCreated]: [
            "getCategories"
        ],
        [SubscriptionEventName.UniverseCreated]: [
            "getUniverseChildren"
        ],
        [SubscriptionEventName.OrderEvent]: [
            "getProfitLoss",
            "getProfitLossSummary"
        ],
        [SubscriptionEventName.ProfitLossChanged]: [
            "getUserTradingPositions",
            "getProfitLoss",
            "getProfitLossSummary"
        ]
    }

    constructor(
        db: DB,
        networkId: number,
        augur: Augur
    ) {
        super(networkId, 'GetterCache', db.dexieDB);
        this.checkExpired = this.checkExpired.bind(this);
        this.clearCaches = this.clearCaches.bind(this);
        this.augur = augur;

        this.subscribeToCacheClearingEvents();
        this.subscribeToNewBlocks();
    }

    static create(db: DB, networkId: number, augur: Augur): GetterCache {
        return new GetterCache(db, networkId, augur);
    }

    async getCachedResponse(name: string, params: any): Promise<any> {
        const result = await this.table
            .where('[name+params]')
            .equals([name, JSON.stringify(params)])
            .toArray();
        if (result.length < 1) {
            return null;
        }
        return result[0];
    }

    async cacheResponse(name: string, params: any, response: any): Promise<void> {
        const timestamp = Date.now();
        this.saveDocuments([{
            name,
            params: JSON.stringify(params),
            response,
            timestamp
        }])
    }

    async clearCaches(names: string[]): Promise<void> {
        await this.table.where("name").anyOfIgnoreCase(names).delete();
    }

    async checkExpired(): Promise<void> {
        const timestamp = Date.now();
        const cutoff = timestamp + this.timeToLive;
        await this.table.where("timestamp").above(cutoff).delete();
    }

    subscribeToCacheClearingEvents() {
        _.forEach(this.eventMapForCacheClearing, (getters: string[], eventName: string) => {
            this.augur.events.on(eventName, () => {this.clearCaches(getters)});
        })
    }

    subscribeToNewBlocks() {
        this.augur.events.on(SubscriptionEventName.NewBlock, this.checkExpired);
    }

    async delete() {
        this.augur.events.off(SubscriptionEventName.NewBlock, this.checkExpired);
        _.forEach(this.eventMapForCacheClearing, (getters: string[], eventName: string) => {
            this.augur.events.off(eventName, () => {this.clearCaches(getters)});
        })
    }
}
