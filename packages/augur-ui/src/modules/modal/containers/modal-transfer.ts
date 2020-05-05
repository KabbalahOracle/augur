import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { TransferForm } from 'modules/modal/transfer-form';
import { AppState } from 'appStore';
import { closeModal } from 'modules/modal/actions/close-modal';
import { formatGasCostToEther, formatEtherEstimate } from 'utils/format-number';
import {
  transferFunds,
  TRANSFER_ETH_GAS_COST,
  TRANSFER_REP_GAS_COST,
  TRANSFER_DAI_GAS_COST,
  transferFundsGasEstimate,
} from 'modules/auth/actions/transfer-funds';
import { ThunkDispatch } from 'redux-thunk';
import { Action } from 'redux';
import { totalTradingBalance } from 'modules/auth/selectors/login-account';
import { AppStatus } from 'modules/app/store/app-status';

const mapStateToProps = (state: AppState) => {
  const { loginAccount } = state;
  const balances = loginAccount.balances;
  balances.dai = totalTradingBalance(loginAccount).toNumber();
  const { modal, gasPriceInfo } = AppStatus.get();
  const gasPrice = gasPriceInfo.userDefinedGasPrice || gasPriceInfo.average;
  return {
  account: loginAccount.address,
  modal,
  balances,
  gasPrice,
  fallBackGasCosts: {
    eth: formatEtherEstimate(
      formatGasCostToEther(
        TRANSFER_ETH_GAS_COST,
        { decimalsRounded: 4 },
        gasPrice
      )
    ),
    rep: formatEtherEstimate(
      formatGasCostToEther(
        TRANSFER_REP_GAS_COST,
        { decimalsRounded: 4 },
        gasPrice
      )
    ),
    dai: formatEtherEstimate(
      formatGasCostToEther(
        TRANSFER_DAI_GAS_COST,
        { decimalsRounded: 4 },
        gasPrice
      )
    ),
  },
}
};

const mapDispatchToProps = (dispatch: ThunkDispatch<void, any, Action>) => ({
  closeModal: () => dispatch(closeModal()),
  transferFundsGasEstimate: (amount: string, asset: string, to: string) =>
    transferFundsGasEstimate(amount, asset, to),
  transferFunds: (amount: string, asset: string, to: string) => {
    transferFunds(amount, asset, to);
    dispatch(closeModal());
  },
});

const mergeProps = (sP: any, dP: any, oP: any) => ({
  fallBackGasCosts: sP.fallBackGasCosts,
  balances: sP.balances,
  account: sP.account,
  gasPrice: sP.gasPrice,
  closeAction: () => dP.closeModal(),
  transferFundsGasEstimate: (amount: string, asset: string, to: string) => dP.transferFundsGasEstimate(amount, asset, to),
  transferFunds: (amount: string, asset: string, to: string) =>
    dP.transferFunds(amount, asset, to),
});

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
  )(TransferForm)
);
