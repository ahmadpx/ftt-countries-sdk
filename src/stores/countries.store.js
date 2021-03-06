import { observable, computed, flow, action } from 'mobx';
import { API_STATE } from '../constants';
import { formatCountry } from '../utils/countries.utils';
import { generateFiltersData } from '../utils/generate-filters.utils';
import CountriesClient from '../clients/countries.client';
import { mapInitialStateToStoreState } from '../utils/store.utils';

export default class CountriesStore {
  /**
   * constructor
   * @param {Object} initialState
   */
  constructor(initialState = {}) {
    this.updateInitialState(initialState);
  }

  @observable.shallow data = [];
  @observable API_STATE = API_STATE.INITIAL;

  /**
   * is loading
   * @return {boolean}
   */
  @computed get isLoading() {
    return this.API_STATE === API_STATE.LOADING;
  }

  /**
   * is fetched
   * @return {boolean}
   */
  @computed get isFetched() {
    return this.API_STATE === API_STATE.SUCCESS;
  }

  /**
   * has error
   * @return {boolean}
   */
  @computed get hasError() {
    return this.API_STATE === API_STATE.FAILED;
  }

  /**
   * countries
   * @returns {Array<Object>}
   */
  @computed get countries() {
    return this.data.map(formatCountry);
  }

  /**
   * filters
   * @returns {{currencies: Array, languages: Array, regions: Array}}
   */
  @computed get filters() {
    return generateFiltersData(this.countries);
  }

  /**
   * update initial state
   * @param {Object} initialState
   */
  @action updateInitialState(initialState) {
    mapInitialStateToStoreState(this, initialState);
  }

  /**
   * fetch all countries
   * @param {Function} errorHandler
   */
  @action.bound
  fetch = flow(function*(errorHandler = () => {}) {
    try {
      this.API_STATE = API_STATE.LOADING;
      const res = yield CountriesClient.getAllCountries();
      this.onSuccess(res);
    } catch (e) {
      this.onError(e, errorHandler);
    }
  });

  /**
   * handle success
   * @param {Object} data
   */
  @action onSuccess(data) {
    this.data = data;
    this.API_STATE = API_STATE.SUCCESS;
  }

  /**
   * handle error
   * @param {Object} error
   * @param {Function} errorHandler
   */
  @action onError(error, errorHandler) {
    errorHandler(error);
    this.API_STATE = API_STATE.FAILED;
  }
}
