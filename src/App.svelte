<script>
    import {csv, autoType, scaleLinear, min, max, select, axisBottom, axisLeft, transition, group} from 'd3';
    import {onMount} from 'svelte';
    import {types} from './types';
    import Aircraft from "./Aircraft.svelte";
    import {maxBy, minBy} from "./utils";

    let rows = [];
    const TYPE_ALL = 'all';
    let type = TYPE_ALL;
    $: description = types[type] ? types[type].description : '';
    let loading = true;
    let headline = "Loading";
    let svg;
    let circles;
    let x;
    let y;
    let highlighted;
    let passengers = Number.POSITIVE_INFINITY;
    let cruiseProfile = 1;

    function interpolateSpeed(d) {
        let least = minBy(d.value, "Speed")
        let most = maxBy(d.value, "Speed")
        let interpolated = least.Speed + ((most.Speed - least.Speed) * cruiseProfile / 100);
        return x(interpolated)
    }


    function interpolateEfficiency(d) {
        let least = minBy(d.value, "Speed")
        let most = maxBy(d.value, "Speed")
        let minSeats = min([d.value[0].Seats, d.value[0]['400NMSeats']]);
        let seatFactor = (passengers === Number.POSITIVE_INFINITY) ? minSeats :  passengers + 1;
        let interpolated = (least.MPG * seatFactor) + (((most.MPG - least.MPG) * cruiseProfile / 100) * seatFactor);
        return y(interpolated)
    }

    let margin = {
        top: 5,
        bottom: 45,
        left: 45,
        right: 5
    };

    let radius = 7;

    function random(list) {
        return list[Math.floor((Math.random() * list.length))];
    }

    $: filteredRows = reFilterRows(rows, type, passengers);

    $: {
        if (svg && filteredRows && cruiseProfile) {

            const slow = transition()
                .duration(1000);

            svg.selectAll('circle')
                .data(filteredRows)
                .join(
                    enter => enter.append('circle')
                        .attr('opacity', 0)
                        .attr('r', radius)
                        .attr('fill', d => types[d.value[0].Type].color)
                        .attr('cx', interpolateSpeed)
                        .attr('cy', interpolateEfficiency)
                        .style('cursor', 'pointer')
                        .call(e => e.transition(slow).attr('opacity', 1)),
                    update => update
                        .call(e => e.transition(slow)
                            .attr('fill', d => {
                                return types[d.value[0].Type].color;
                            })
                            .attr('cx', interpolateSpeed)
                            .attr('cy', interpolateEfficiency)
                        ),
                    remove => remove
                        .call(e => e.transition(slow).attr('opacity', 0))
                        .remove()
                )
                .on('click', e => { highlighted = e.target["__data__"] })
        }
    }

    function reFilterRows(sourceRows, typeString, passengerCount) {
        let filtered = sourceRows.filter(r => {
            let allowed = true
            let minSeats = min([r.value[0].Seats, r.value[0]['400NMSeats']])
            if (typeString !== TYPE_ALL && r.value[0].Type !== type) {
                allowed = false
            } else if (passengers !== Number.POSITIVE_INFINITY && minSeats < passengerCount + 1) {
                allowed = false
            }
            if (!allowed && r === highlighted) {
                highlighted = undefined;
            }
            return allowed
        });
        return filtered
    }

    onMount(() => {
        let box = document.getElementById('js-svg-container');
        let boxWidth = Math.round(box.offsetWidth - 2);
        let width = boxWidth - margin.left - margin.right - radius * 2;
        let height = Math.round(width * .61 - radius * 2);

        csv('aircraft_data.csv', autoType).then(data => {

            let speeds = data.map(d => d.Speed);
            let smpg = data.map(d => d.SMPG);
            let mpg = data.map(d => d.MPG);

            let grouped = Array.from(group(data, d => d.Airplane), ([key, value]) => ({key, value}))

            // define x and y scale functions
            x = scaleLinear()
                .domain([min(speeds), max(speeds)])
                .range([margin.left + radius, boxWidth - margin.right - radius]);

            y = scaleLinear()
                .domain([max(smpg), min(mpg)])
                .range([margin.top + radius, height - margin.bottom - radius]);

            svg = select('#js-svg-container')
                .append('svg')
                .attr('height', height)
                .attr('width', boxWidth);

            // x axis
            let scaleXAxis = axisBottom()
                .scale(x);

            svg.append("g")
                .attr('transform', 'translate(0,' + (height - margin.bottom) + ')')
                .call(scaleXAxis);

            svg.append('text')
                .attr('x', margin.left + width / 2)
                .attr('y', height - 3)
                .attr('text-anchor', 'middle')
                .text('Speed (kts)')
                .attr('fill', '#444444');

            let scaleYAxis = axisLeft()
                .scale(y);

            // y axis
            svg.append("g")
                .attr('transform', 'translate(' + margin.left + ', 0)')
                .call(scaleYAxis);

            svg.append('text')
                .attr('x', 12)
                .attr('y', height / 2)
                .attr('text-anchor', 'middle')
                .attr('transform', 'rotate(-90, 12, ' + height / 2 + ')')
                .text('Seat-miles / gallon')
                .attr('fill', '#444444');


            headline = 'Fuel Efficiency for Owner-flown Aircraft';
            rows = grouped;
            loading = false;
        });
    })
</script>
<style>
    h1 {
        color: #123456;
    }
    .container {
        max-width: 600px;
        margin: 0 auto 200px auto;
    }
    input {
        padding: 0;
        margin: 0;
    }
</style>
<div class="container">
    <h1>{headline}</h1>
    <label class="mb-2">
        Engine type:
        <select bind:value={type}>
            <option value={TYPE_ALL}>Show all</option>
            {#each Object.keys(types) as id}
                <option value={id}>{types[id].name}</option>
            {/each}
        </select>
    </label>
    <label class="mb-2">
        Passengers:
        <select bind:value={passengers}>
            <option value={0}>Solo</option>
            {#each [1,2,3,4,5,6,7,8] as p}
                <option value={p}>{p}</option>
            {/each}
            <option value={Number.POSITIVE_INFINITY}>Capacity</option>
        </select>
    </label>
    <label class="mb-2">
        Max range <input type="range" min="1" max="100" bind:value={cruiseProfile} /> Max speed
    </label>
    <div id="js-svg-container"></div>
    {#if highlighted}
        <Aircraft name={highlighted.key} performanceData={highlighted.value} {passengers} {cruiseProfile} />
    {:else}
        <div class="mb-4">click any data point to see aircraft and stats</div>
    {/if}
    <div class="mb-4"><a href="aircraft_data.csv">download all source data</a></div>
    <div><a href="https://github.com/natevaughan/flying-slow">see source code</a></div>
</div>
