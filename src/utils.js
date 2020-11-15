
export function minBy(arr, fieldName) {
    let lowest = arr[0];
    for (let i = arr.length-1; i>=0; i--) {
        if (arr[i][fieldName] < lowest[fieldName]) lowest = arr[i];
    }
    return lowest
}

export function maxBy(arr, fieldName) {
    let highest = arr[0];
    for (let i = arr.length-1; i>=0; i--) {
        if (arr[i][fieldName] > highest[fieldName]) highest = arr[i];
    }
    return highest
}