import useSWRInfinite from 'swr/infinite';
import { openmrsFetch, useConfig, type FetchResponse } from '@openmrs/esm-framework';
import { type SMSLog, type SMSLogsResponse } from '../types';
import { type ConfigObject } from '../config-schema';

export function useLogsRecords() {
  const { configurationPageSize = 10 } = useConfig<ConfigObject>();
  const getKey = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.rows.length) return null;

    return `/ws/sms/log?page=${pageIndex + 1}&rows=${configurationPageSize}&sortColumn=id&sortDirection=desc`;
  };

  const { data, error, size, setSize, isValidating, isLoading, mutate } = useSWRInfinite<
    FetchResponse<SMSLogsResponse>,
    Error
  >(getKey, openmrsFetch);

  const smsLogs: SMSLog[] = data ? [].concat(...data.map((page) => page.data.rows)) : [];
  // const isLoading = !data && !error;
  // const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isReachingEnd = data && data[data.length - 1]?.data?.rows.length < configurationPageSize;

  return {
    smsLogs,
    isLoadingLogs: isLoading,
    // isLoadingMore,
    isValidatingLogs: isValidating,
    mutateLogs: mutate,
    isReachingEnd,
    setSize,
    error,
  };
}