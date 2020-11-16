<script>
    import {maxBy, minBy} from "./utils";
    import {min} from 'd3'

    export let name;
    export let performanceData;
    export let passengers;
    export let cruiseProfile;

    $: maxEcon = minBy(performanceData, 'Speed')
    $: maxCruise = maxBy(performanceData, 'Speed')
    $: interpolatedSpeed = interpolateSpeed(maxEcon, maxCruise, cruiseProfile)
    $: interpolatedSmpg = interpolateEfficiency(maxEcon, maxCruise, cruiseProfile, passengers)


    function interpolateSpeed(econ, fast, profile) {
        if (!profile) {
            return
        }
        return econ.Speed + ((fast.Speed - econ.Speed) * profile / 100);
    }


    function interpolateEfficiency(econ, fast, profile, passg) {
        if (!profile || typeof passg === 'undefined') {
            return
        }
        let minSeats = min([econ.Seats, econ['400NMSeats']]);
        let seatFactor = (passg === Number.POSITIVE_INFINITY) ? minSeats : min([minSeats, (passg + 1)]);
        return (econ.MPG * seatFactor) + (((fast.MPG - econ.MPG) * profile / 100) * seatFactor);
    }

    function roundNumber(num, dec) {
        return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
    }
</script>
<style>
    .row {
        margin-top: 4px;
        font-family: "Courier New", Courier, fixed-width;
    }
    .highlight {
        font-weight: 800;
    }
</style>
<div class="row mb-4">
    <h3>{name}</h3>
    {#if passengers > 0}
        <div class="highlight mb-2">{passengers === Number.POSITIVE_INFINITY ?  min([maxEcon.Seats, maxEcon['400NMSeats']]) : passengers} passengers @ {roundNumber(interpolatedSpeed, 0)} kts: {roundNumber(interpolatedSmpg, 1)} SMPG</div>
    {:else}
        <div class="highlight mb-2">Solo @ {roundNumber(interpolatedSpeed, 0)} kts: {roundNumber(interpolatedSmpg, 1)} MPG</div>
    {/if}
    <div>400-NM Seats: {min([performanceData[0]["400NMSeats"], performanceData[0]["Seats"]])}</div>
    <div>Econ cruise: {maxEcon.Speed} kts,  {maxEcon.Burn} gph @ {maxEcon.Altitude ? maxEcon.Altitude + ' ft' : '-' } <a href={maxEcon.Source}>(source)</a></div>
    <div>Max cruise: {maxCruise.Speed} kts, {maxCruise.Burn} gph @ {maxCruise.Altitude ? maxCruise.Altitude + ' ft' : '-' } <a href={maxCruise.Source}>(source)</a></div>
</div>