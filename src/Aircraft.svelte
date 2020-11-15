<script>
    import {maxBy, minBy} from "./utils";
    import {min} from 'd3'

    export let name;
    export let performanceData;
    export let passengers;
    export let cruiseProfile;

    $: maxEcon = minBy(performanceData, 'Speed')
    $: maxCruise = maxBy(performanceData, 'Speed')
    $: interpolatedSpeed = interpolateSpeed(cruiseProfile)
    $: interpolatedSmpg = interpolateEfficiency(cruiseProfile, passengers)


    function interpolateSpeed(profile) {
        if (!profile) {
            return
        }
        return maxEcon.Speed + ((maxCruise.Speed - maxEcon.Speed) * profile / 100);
    }


    function interpolateEfficiency(profile, passg) {
        if (!profile || typeof passg === 'undefined') {
            return
        }
        let minSeats = min([maxEcon.Seats, maxEcon['400NMSeats']]);
        let seatFactor = (passg === Number.POSITIVE_INFINITY) ? minSeats : min([minSeats, (passg + 1)]);
        return (maxEcon.MPG * seatFactor) + (((maxCruise.MPG - maxEcon.MPG) * profile / 100) * seatFactor);
    }

    function roundNumber(num, dec) {
        return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
    }
</script>
<style>
    .row {
        margin-top: 4px;
        margin-bottom: 4px;
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
    <div>Econ cruise: {maxEcon.Speed} kts,  {maxEcon.Burn} gph @ {maxEcon.Altitude || 'unknown' } ft <a href={maxEcon.Source}>(source)</a></div>
    <div>Max cruise: {maxCruise.Speed} kts, {maxCruise.Burn} gph @ {maxCruise.Altitude || 'unknown' } ft <a href={maxCruise.Source}>(source)</a></div>
</div>