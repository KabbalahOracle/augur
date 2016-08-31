import { BUY, SELL } from '../../trade/constants/types';

import { addTradeTransaction } from '../../transactions/actions/add-trade-transaction';
import { selectMarket } from '../../market/selectors/market';
import { clearTradeInProgress } from '../../trade/actions/update-trades-in-progress';
import { updateTradeCommitLock } from '../../trade/actions/update-trade-commit-lock';
import { selectTransactionsLink } from '../../link/selectors/links';
import { calculateSellTradeIDs, calculateBuyTradeIDs } from '../../trade/actions/helpers/calculate-trade-ids';
import { addBidTransaction } from '../../transactions/actions/add-bid-transaction';
import { addAskTransaction } from '../../transactions/actions/add-ask-transaction';
import { addShortSellTransaction } from '../../transactions/actions/add-short-sell-transaction';
import { addShortAskTransaction } from '../../transactions/actions/add-short-ask-transaction';
import { selectMarketLink } from '../../link/selectors/links';

export function placeTrade(marketID) {
	return (dispatch, getState) => {
		const { tradesInProgress, outcomesData, orderBooks, loginAccount } = getState();
		const marketTradeInProgress = tradesInProgress[marketID];
		const market = selectMarket(marketID);
		const marketLink = selectMarketLink({id: marketID}, dispatch);

		if (!marketTradeInProgress || !market) {
			return;
		}

		let outcomeTradeInProgress;
		Object.keys(marketTradeInProgress).forEach(outcomeID => {
			outcomeTradeInProgress = marketTradeInProgress[outcomeID];
			if (!outcomeTradeInProgress || !outcomeTradeInProgress.limitPrice || !outcomeTradeInProgress.numShares || !outcomeTradeInProgress.totalCost) {
				return;
			}

			const totalCost = Math.abs(outcomeTradeInProgress.totalCost);

			if (outcomeTradeInProgress.side === BUY) {
				const tradeIDs = calculateBuyTradeIDs(marketID, outcomeID, outcomeTradeInProgress.limitPrice, orderBooks, loginAccount.id);
				if (tradeIDs && tradeIDs.length) {
					dispatch(updateTradeCommitLock(true));
					dispatch(addTradeTransaction(
						BUY,
						marketID,
						marketLink,
						outcomeID,
						market.type,
						market.description,
						outcomesData[marketID][outcomeID].name,
						outcomeTradeInProgress.numShares,
						outcomeTradeInProgress.limitPrice,
						totalCost,
						outcomeTradeInProgress.tradingFeesEth,
						outcomeTradeInProgress.gasFeesRealEth));
				} else {
					dispatch(addBidTransaction(
						marketID,
						marketLink,
						outcomeID,
						market.description,
						outcomesData[marketID][outcomeID].name,
						outcomeTradeInProgress.numShares,
						outcomeTradeInProgress.limitPrice,
						totalCost,
						outcomeTradeInProgress.tradingFeesEth,
						outcomeTradeInProgress.gasFeesRealEth));
				}
			} else if (outcomeTradeInProgress.side === SELL) {
				const tradeIDs = calculateSellTradeIDs(marketID, outcomeID, outcomeTradeInProgress.limitPrice, orderBooks, loginAccount.id);

				// check if user has position
				//  - if so, sell/ask
				//  - if not, short sell/short ask
				let position;
				if (market.myPositionOutcomes) {
					const numPositions = market.myPositionOutcomes.length;
					for (let i = 0; i < numPositions; ++i) {
						if (market.myPositionOutcomes[i].id === outcomeID) {
							position = market.myPositionOutcomes[i].position.qtyShares;
							break;
						}
					}
				}
				if (position && position.value > 0) {
					if (tradeIDs && tradeIDs.length) {
						dispatch(updateTradeCommitLock(true));
						dispatch(addTradeTransaction(
							SELL,
							marketID,
							marketLink,
							outcomeID,
							market.type,
							market.description,
							outcomesData[marketID][outcomeID].name,
							outcomeTradeInProgress.numShares,
							outcomeTradeInProgress.limitPrice,
							totalCost,
							outcomeTradeInProgress.tradingFeesEth,
							outcomeTradeInProgress.gasFeesRealEth));
					} else {
						dispatch(addAskTransaction(
							marketID,
							marketLink,
							outcomeID,
							market.description,
							outcomesData[marketID][outcomeID].name,
							outcomeTradeInProgress.numShares,
							outcomeTradeInProgress.limitPrice,
							totalCost,
							outcomeTradeInProgress.tradingFeesEth,
							outcomeTradeInProgress.gasFeesRealEth));
					}
				} else {
					if (tradeIDs && tradeIDs.length) {
						dispatch(updateTradeCommitLock(true));
						dispatch(addShortSellTransaction(
							marketID,
							marketLink,
							outcomeID,
							market.description,
							outcomesData[marketID][outcomeID].name,
							outcomeTradeInProgress.numShares,
							outcomeTradeInProgress.limitPrice,
							totalCost,
							outcomeTradeInProgress.tradingFeesEth,
							outcomeTradeInProgress.gasFeesRealEth));
					} else {
						dispatch(addShortAskTransaction(
							marketID,
							marketLink,
							outcomeID,
							market.description,
							outcomesData[marketID][outcomeID].name,
							outcomeTradeInProgress.numShares,
							outcomeTradeInProgress.limitPrice,
							totalCost,
							outcomeTradeInProgress.tradingFeesEth,
							outcomeTradeInProgress.gasFeesRealEth));
					}
				}
			}
		});

		dispatch(clearTradeInProgress(marketID));

		selectTransactionsLink(dispatch).onClick();
	};
}
