export interface IHeaderMenuItem {
    label: string;
    icon?: string;
    showWarning?: boolean;
    command?: (event?: any) => void;
    class?: string;
    route?: string;
}
