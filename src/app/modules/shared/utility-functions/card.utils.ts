export function bindCardLogo(brand) {
    let logoUrl = '';
    if (brand) {
        switch (brand.toLowerCase()) {
            case 'mc':
                logoUrl = 'assets/images/card-logos/mastercard.svg';
                break;
            case 'visa':
                logoUrl = 'assets/images/card-logos/visa.svg';
                break;
            case 'amex':
                logoUrl = 'assets/images/card-logos/american-express.svg';
                break;
            // case 'diners club':
            //     logoUrl = 'assets/images/card-logos/diners-club-credit-card-logo.png';
            //     break;
            case 'disc':
                logoUrl = 'assets/images/card-logos/discover.svg';
                break;
            case 'jcb':
                logoUrl = 'assets/images/card-logos/jcb.png';
                break;
            // case 'unionpay':
            //     logoUrl = 'assets/images/card-logos/unionpay.png';
            //     break;
            default:
                break;
        }
    }

    return logoUrl;
}
