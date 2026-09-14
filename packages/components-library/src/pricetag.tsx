import * as React from "react";
import getSymbolFromCurrency from "currency-symbol-map";

interface PriceTagProps {
    cost: number;
    freeCostCaption: string;
    currencyISOCode: string;
}

const PriceTag = (props: PriceTagProps) => {
    const cost = props.cost || 0;
    // Prix a la francaise : le montant d'abord, le symbole ensuite,
    // separes par une espace insecable.
    const symbole =
        getSymbolFromCurrency(props.currencyISOCode.toUpperCase()) ||
        props.currencyISOCode.toUpperCase();
    const costText =
        cost <= 0
            ? props.freeCostCaption
            : `${String(cost).replace(".", ",")} ${symbole}`;

    return <div className="font-medium">{costText}</div>;
};

export default PriceTag;
