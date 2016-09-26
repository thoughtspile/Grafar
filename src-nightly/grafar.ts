import { grafar } from './api';

import { UI, ui } from './UI';

import { Registry } from './Registry';
import { Style } from './Style';
import { Panel } from './Panel';
import { GrafarObject } from './GrafarObject';
import * as generators from './generators';


grafar['Style'] = Style;
grafar['Panel'] = Panel;
grafar['Object'] = GrafarObject;
grafar['UI'] = UI;
grafar['ui'] = ui;

const registry = new Registry();

Object.keys(generators).forEach(key => {
    grafar[key] = generators[key];
});

// bootstrap
grafar.update();

window['grafar'] = grafar;