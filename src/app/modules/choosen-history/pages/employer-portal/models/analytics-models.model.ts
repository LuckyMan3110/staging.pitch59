export class AnalyticsTab {
    name: string;
    active: boolean;
    columns: AnalyticsColumn[];
}

export class AnalyticsColumn {
    name: string;
    types: number[];
}

export class AnalyticsChartData {
    labels: string[];
    datasets: ChartDataSet[];
}

export class ChartDataSet {
    label: string;
    backgroundColor: '#25AEB4';
    borderColor: '#25AEB4';
    data: number[];
}
