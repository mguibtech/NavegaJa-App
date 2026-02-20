import React, {useState, useCallback, useMemo} from 'react';
import {Modal, ScrollView, TouchableOpacity} from 'react-native';
import {SvgXml} from 'react-native-svg';

import {Box, Icon, Text, TouchableOpacityBox} from '@components';
import {
  DiceBearStyle,
  generateDiceBearSvg,
  buildDiceBearUrl,
  parseDiceBearUrl,
} from '../UserAvatar/UserAvatar';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Swatch = {value: string; bg: string};

interface ColorPickerConfig {
  label: string;
  optionKey: string;
  colors: Swatch[];
}

interface ThumbPickerConfig {
  label: string;
  optionKey: string;
  values: string[];
  toggleable?: boolean; // if true, adds "none" as first option (shows ✗ icon)
  noneLabel?: string;
}

interface ChipPickerConfig {
  label: string;
  optionKey: string;
  options: {value: string; label: string}[];
  // 'none' value means delete the key from options (not stored as 'none')
}

interface StyleConfig {
  colorPickers: ColorPickerConfig[];
  thumbPickers: ThumbPickerConfig[];
  chipPickers: ChipPickerConfig[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const STYLES: {key: DiceBearStyle; label: string}[] = [
  {key: 'avataaars', label: 'Cartoon'},
  {key: 'micah', label: 'Moderno'},
  {key: 'lorelei', label: 'Ilustrado'},
  {key: 'adventurer', label: 'Aventura'},
  {key: 'open-peeps', label: 'People'},
  {key: 'personas', label: 'Persona'},
  {key: 'notionists', label: 'Notion'},
  {key: 'bottts', label: 'Robô'},
  {key: 'pixel-art', label: 'Pixel'},
  {key: 'fun-emoji', label: 'Emoji'},
  {key: 'thumbs', label: 'Thumbs'},
  {key: 'initials', label: 'Iniciais'},
];

const RANDOM_SEEDS = [
  'Felix', 'Luna', 'Max', 'Zara', 'Theo', 'Mia', 'Leo', 'Aria',
  'Noah', 'Ivy', 'Liam', 'Nora', 'Eli', 'Cora', 'Hugo', 'Elsa',
  'Ace', 'Roux', 'Finn', 'Skye', 'Jax', 'Nova', 'Rex', 'Wren',
];
function randomSeed() {
  return RANDOM_SEEDS[Math.floor(Math.random() * RANDOM_SEEDS.length)];
}
const THUMB_SEED = 'Sam';

// ─── Color palettes ───────────────────────────────────────────────────────────

const AVATAAARS_SKIN: Swatch[] = [
  {value: 'ffdbb4', bg: '#ffdbb4'}, {value: 'edb98a', bg: '#edb98a'},
  {value: 'd08b5b', bg: '#d08b5b'}, {value: 'ae5d29', bg: '#ae5d29'},
  {value: '614335', bg: '#614335'}, {value: 'fd9841', bg: '#fd9841'},
  {value: 'f8d25c', bg: '#f8d25c'},
];
const AVATAAARS_HAIR_COLOR: Swatch[] = [
  {value: '2c1b18', bg: '#2c1b18'}, {value: '4a312c', bg: '#4a312c'},
  {value: 'a55728', bg: '#a55728'}, {value: 'b58143', bg: '#b58143'},
  {value: 'd6b370', bg: '#d6b370'}, {value: 'ecdcbf', bg: '#ecdcbf'},
  {value: 'c93305', bg: '#c93305'}, {value: 'f59797', bg: '#f59797'},
  {value: 'e8e1e1', bg: '#e8e1e1'},
];
const MICAH_SKIN: Swatch[] = [
  {value: 'f9c9b6', bg: '#f9c9b6'}, {value: 'edc592', bg: '#edc592'},
  {value: 'ac6651', bg: '#ac6651'}, {value: 'b16a5b', bg: '#b16a5b'},
  {value: '77311d', bg: '#77311d'},
];
const MICAH_HAIR_COLOR: Swatch[] = [
  {value: '000000', bg: '#000000'}, {value: 'd2eff3', bg: '#d2eff3'},
  {value: 'e0ddff', bg: '#e0ddff'}, {value: 'f4d150', bg: '#f4d150'},
  {value: 'ac6651', bg: '#ac6651'}, {value: '9287ff', bg: '#9287ff'},
  {value: 'ffeba4', bg: '#ffeba4'}, {value: 'fc909f', bg: '#fc909f'},
  {value: '6bd9e9', bg: '#6bd9e9'},
];
const ADVENTURER_SKIN: Swatch[] = [
  {value: 'f2d3b1', bg: '#f2d3b1'}, {value: 'ecad80', bg: '#ecad80'},
  {value: '9e5622', bg: '#9e5622'}, {value: '763900', bg: '#763900'},
];
const ADVENTURER_HAIR_COLOR: Swatch[] = [
  {value: '0e0e0e', bg: '#0e0e0e'}, {value: '562306', bg: '#562306'},
  {value: '6a4e35', bg: '#6a4e35'}, {value: '796a45', bg: '#796a45'},
  {value: 'b9a05f', bg: '#b9a05f'}, {value: 'e5d7a3', bg: '#e5d7a3'},
  {value: 'ab2a18', bg: '#ab2a18'}, {value: 'cb6820', bg: '#cb6820'},
  {value: 'afafaf', bg: '#afafaf'}, {value: '3eac2c', bg: '#3eac2c'},
  {value: '85c2c6', bg: '#85c2c6'}, {value: 'dba3be', bg: '#dba3be'},
  {value: '592454', bg: '#592454'},
];
const OPEN_PEEPS_SKIN: Swatch[] = [
  {value: 'ffdbb4', bg: '#ffdbb4'}, {value: 'edb98a', bg: '#edb98a'},
  {value: 'd08b5b', bg: '#d08b5b'}, {value: 'ae5d29', bg: '#ae5d29'},
  {value: '694d3d', bg: '#694d3d'},
];
const OPEN_PEEPS_CLOTHING: Swatch[] = [
  {value: 'e78276', bg: '#e78276'}, {value: 'ffcf77', bg: '#ffcf77'},
  {value: 'fdea6b', bg: '#fdea6b'}, {value: '78e185', bg: '#78e185'},
  {value: '9ddadb', bg: '#9ddadb'}, {value: '8fa7df', bg: '#8fa7df'},
  {value: 'e279c7', bg: '#e279c7'},
];
const PERSONAS_SKIN: Swatch[] = [
  {value: 'eeb4a4', bg: '#eeb4a4'}, {value: 'e7a391', bg: '#e7a391'},
  {value: 'e5a07e', bg: '#e5a07e'}, {value: 'd78774', bg: '#d78774'},
  {value: 'b16a5b', bg: '#b16a5b'}, {value: '92594b', bg: '#92594b'},
  {value: '623d36', bg: '#623d36'},
];
const PERSONAS_HAIR_COLOR: Swatch[] = [
  {value: '362c47', bg: '#362c47'}, {value: '6c4545', bg: '#6c4545'},
  {value: 'e15c66', bg: '#e15c66'}, {value: 'f27d65', bg: '#f27d65'},
  {value: 'f29c65', bg: '#f29c65'}, {value: 'dee1f5', bg: '#dee1f5'},
  {value: 'e16381', bg: '#e16381'},
];
const PERSONAS_CLOTHING: Swatch[] = [
  {value: '456dff', bg: '#456dff'}, {value: '54d7c7', bg: '#54d7c7'},
  {value: '7555ca', bg: '#7555ca'}, {value: '6dbb58', bg: '#6dbb58'},
  {value: 'e24553', bg: '#e24553'}, {value: 'f3b63a', bg: '#f3b63a'},
  {value: 'f55d81', bg: '#f55d81'},
];
const BOTTTS_BASE: Swatch[] = [
  {value: 'ffb300', bg: '#ffb300'}, {value: '1e88e5', bg: '#1e88e5'},
  {value: '546e7a', bg: '#546e7a'}, {value: '00acc1', bg: '#00acc1'},
  {value: 'f4511e', bg: '#f4511e'}, {value: '5e35b1', bg: '#5e35b1'},
  {value: '43a047', bg: '#43a047'}, {value: '757575', bg: '#757575'},
  {value: '3949ab', bg: '#3949ab'}, {value: '7cb342', bg: '#7cb342'},
  {value: 'c0ca33', bg: '#c0ca33'}, {value: 'fb8c00', bg: '#fb8c00'},
  {value: 'd81b60', bg: '#d81b60'}, {value: '8e24aa', bg: '#8e24aa'},
  {value: 'e53935', bg: '#e53935'}, {value: '00897b', bg: '#00897b'},
  {value: 'fdd835', bg: '#fdd835'}, {value: '039be5', bg: '#039be5'},
  {value: '6d4c41', bg: '#6d4c41'},
];
const PIXEL_ART_HAIR_COLOR: Swatch[] = [
  {value: 'cab188', bg: '#cab188'}, {value: '603a14', bg: '#603a14'},
  {value: '83623b', bg: '#83623b'}, {value: 'a78961', bg: '#a78961'},
  {value: '611c17', bg: '#611c17'}, {value: '28150a', bg: '#28150a'},
  {value: '009bbd', bg: '#009bbd'}, {value: 'bd1700', bg: '#bd1700'},
  {value: '91cb15', bg: '#91cb15'},
];
const PIXEL_ART_CLOTHING_COLOR: Swatch[] = [
  {value: '5bc0de', bg: '#5bc0de'}, {value: '428bca', bg: '#428bca'},
  {value: '03396c', bg: '#03396c'}, {value: '88d8b0', bg: '#88d8b0'},
  {value: 'ff6f69', bg: '#ff6f69'}, {value: 'd11141', bg: '#d11141'},
  {value: 'ffeead', bg: '#ffeead'}, {value: 'ffc425', bg: '#ffc425'},
];
const FUN_EMOJI_BG: Swatch[] = [
  {value: 'fcbc34', bg: '#fcbc34'}, {value: 'd84be5', bg: '#d84be5'},
  {value: 'd9915b', bg: '#d9915b'}, {value: 'f6d594', bg: '#f6d594'},
  {value: '059ff2', bg: '#059ff2'}, {value: '71cf62', bg: '#71cf62'},
];
const THUMBS_BG: Swatch[] = [
  {value: '0a5b83', bg: '#0a5b83'}, {value: '1c799f', bg: '#1c799f'},
  {value: '69d2e7', bg: '#69d2e7'}, {value: 'f1f4dc', bg: '#f1f4dc'},
  {value: 'f88c49', bg: '#f88c49'},
];
const INITIALS_BG: Swatch[] = [
  {value: 'e53935', bg: '#e53935'}, {value: 'd81b60', bg: '#d81b60'},
  {value: '8e24aa', bg: '#8e24aa'}, {value: '5e35b1', bg: '#5e35b1'},
  {value: '3949ab', bg: '#3949ab'}, {value: '1e88e5', bg: '#1e88e5'},
  {value: '039be5', bg: '#039be5'}, {value: '00acc1', bg: '#00acc1'},
  {value: '00897b', bg: '#00897b'}, {value: '43a047', bg: '#43a047'},
  {value: '7cb342', bg: '#7cb342'}, {value: 'c0ca33', bg: '#c0ca33'},
  {value: 'fdd835', bg: '#fdd835'}, {value: 'ffb300', bg: '#ffb300'},
  {value: 'fb8c00', bg: '#fb8c00'}, {value: 'f4511e', bg: '#f4511e'},
];

// ─────────────────────────────────────────────────────────────────────────────
// Style option configs
// ─────────────────────────────────────────────────────────────────────────────

const STYLE_CONFIG: Record<DiceBearStyle, StyleConfig> = {
  avataaars: {
    colorPickers: [
      {label: 'Cor da Pele', optionKey: 'skinColor', colors: AVATAAARS_SKIN},
      {label: 'Cor do Cabelo', optionKey: 'hairColor', colors: AVATAAARS_HAIR_COLOR},
    ],
    thumbPickers: [
      {label: 'Cabelo', optionKey: 'top', values: ['bigHair','bob','bun','curly','curvy','dreads','fro','longButNotTooLong','shavedSides','shortCurly','shortFlat','shortRound','sides','straight01','theCaesar','turban','hijab','hat','winterHat1']},
      {label: 'Acessórios', optionKey: 'accessories', toggleable: true, noneLabel: 'Nenhum', values: ['prescription01','prescription02','round','sunglasses','wayfarers','kurt']},
      {label: 'Barba', optionKey: 'facialHair', toggleable: true, noneLabel: 'Nenhum', values: ['beardLight','beardMagestic','beardMedium','moustacheFancy','moustacheMagnum']},
    ],
    chipPickers: [],
  },
  micah: {
    colorPickers: [
      {label: 'Cor da Pele', optionKey: 'baseColor', colors: MICAH_SKIN},
      {label: 'Cor do Cabelo', optionKey: 'hairColor', colors: MICAH_HAIR_COLOR},
    ],
    thumbPickers: [
      {label: 'Cabelo', optionKey: 'hair', values: ['fonze','mrT','dougFunny','mrClean','dannyPhantom','full','turban','pixie']},
      {label: 'Olhos', optionKey: 'eyes', values: ['eyes','round','eyesShadow','smiling','smilingShadow']},
      {label: 'Boca', optionKey: 'mouth', values: ['laughing','smile','nervous','surprised','sad','pucker','frown','smirk']},
      {label: 'Sobrancelhas', optionKey: 'eyebrows', values: ['up','down','eyelashesUp','eyelashesDown']},
      {label: 'Camisa', optionKey: 'shirt', values: ['open','crew','collared']},
      {label: 'Óculos', optionKey: 'glasses', toggleable: true, noneLabel: 'Nenhum', values: ['round','square']},
      {label: 'Barba', optionKey: 'facialHair', toggleable: true, noneLabel: 'Nenhum', values: ['beard','scruff']},
      {label: 'Brinco', optionKey: 'earrings', toggleable: true, noneLabel: 'Nenhum', values: ['hoop','stud']},
    ],
    chipPickers: [],
  },
  lorelei: {
    colorPickers: [],
    thumbPickers: [
      {label: 'Cabelo', optionKey: 'hair', values: ['variant01','variant04','variant08','variant12','variant16','variant20','variant24','variant28','variant32','variant36','variant40','variant44','variant48']},
      {label: 'Boca', optionKey: 'mouth', values: ['happy01','happy03','happy05','happy07','happy09','happy12','happy15','happy18','sad01','sad04','sad07']},
      {label: 'Sobrancelhas', optionKey: 'eyebrows', values: ['variant01','variant02','variant03','variant04','variant05','variant06']},
      {label: 'Óculos', optionKey: 'glasses', toggleable: true, noneLabel: 'Nenhum', values: ['variant01','variant02','variant03','variant04','variant05']},
      {label: 'Barba', optionKey: 'beard', toggleable: true, noneLabel: 'Nenhum', values: ['variant01','variant02']},
      {label: 'Brinco', optionKey: 'earrings', toggleable: true, noneLabel: 'Nenhum', values: ['variant01','variant02','variant03']},
    ],
    chipPickers: [],
  },
  adventurer: {
    colorPickers: [
      {label: 'Cor da Pele', optionKey: 'skinColor', colors: ADVENTURER_SKIN},
      {label: 'Cor do Cabelo', optionKey: 'hairColor', colors: ADVENTURER_HAIR_COLOR},
    ],
    thumbPickers: [
      {label: 'Cabelo', optionKey: 'hair', values: ['short01','short04','short07','short10','short13','short16','short19','long01','long05','long10','long15','long20','long26']},
      {label: 'Olhos', optionKey: 'eyes', values: ['variant01','variant03','variant05','variant07','variant09','variant11','variant13','variant15','variant20','variant26']},
      {label: 'Boca', optionKey: 'mouth', values: ['variant01','variant03','variant05','variant07','variant09','variant12','variant15','variant20','variant25','variant30']},
      {label: 'Óculos', optionKey: 'glasses', toggleable: true, noneLabel: 'Nenhum', values: ['variant01','variant02','variant03','variant04','variant05']},
      {label: 'Brinco', optionKey: 'earrings', toggleable: true, noneLabel: 'Nenhum', values: ['variant01','variant02','variant03','variant04','variant05','variant06']},
    ],
    chipPickers: [
      {label: 'Detalhes do Rosto', optionKey: 'features', options: [
        {value: 'none', label: 'Nenhum'}, {value: 'freckles', label: 'Sardas'},
        {value: 'blush', label: 'Blush'}, {value: 'birthmark', label: 'Sinal'},
        {value: 'mustache', label: 'Bigode'},
      ]},
    ],
  },
  'open-peeps': {
    colorPickers: [
      {label: 'Cor da Pele', optionKey: 'skinColor', colors: OPEN_PEEPS_SKIN},
      {label: 'Cor da Roupa', optionKey: 'clothingColor', colors: OPEN_PEEPS_CLOTHING},
    ],
    thumbPickers: [
      {label: 'Cabelo', optionKey: 'head', values: ['afro','bangs','bun','cornrows','dreads1','flatTop','hijab','long','longCurly','medium1','mohawk','noHair1','short1','short3','turban']},
      {label: 'Expressão', optionKey: 'face', values: ['calm','cheeky','concerned','cute','driven','explaining','lovingGrin1','smile','smileBig','smileLOL','solemn']},
      {label: 'Barba', optionKey: 'facialHair', toggleable: true, noneLabel: 'Nenhum', values: ['chin','full','full2','goatee1','goatee2','moustache1','moustache3','moustache5']},
      {label: 'Óculos', optionKey: 'accessories', toggleable: true, noneLabel: 'Nenhum', values: ['eyepatch','glasses','glasses2','glasses3','glasses4','glasses5','sunglasses','sunglasses2']},
    ],
    chipPickers: [],
  },
  personas: {
    colorPickers: [
      {label: 'Cor da Pele', optionKey: 'skinColor', colors: PERSONAS_SKIN},
      {label: 'Cor do Cabelo', optionKey: 'hairColor', colors: PERSONAS_HAIR_COLOR},
      {label: 'Cor da Roupa', optionKey: 'clothingColor', colors: PERSONAS_CLOTHING},
    ],
    thumbPickers: [
      {label: 'Cabelo', optionKey: 'hair', values: ['long','sideShave','shortCombover','curlyHighTop','bobCut','curly','pigtails','curlyBun','buzzcut','bobBangs','bald','balding','cap','fade','mohawk','beanie','extraLong','shortComboverChops']},
      {label: 'Olhos', optionKey: 'eyes', values: ['open','sleep','wink','glasses','happy','sunglasses']},
      {label: 'Boca', optionKey: 'mouth', values: ['smile','frown','surprise','bigSmile','smirk','lips']},
      {label: 'Tipo de Corpo', optionKey: 'body', values: ['squared','rounded','small','checkered']},
      {label: 'Barba', optionKey: 'facialHair', toggleable: true, noneLabel: 'Nenhum', values: ['beardMustache','pyramid','walrus','goatee','shadow','soulPatch']},
    ],
    chipPickers: [],
  },
  notionists: {
    colorPickers: [],
    thumbPickers: [
      {label: 'Cabelo', optionKey: 'hair', values: ['variant01','variant05','variant10','variant15','variant20','variant25','variant30','variant35','variant40','variant45','variant50','variant55','variant63','hat']},
      {label: 'Corpo', optionKey: 'body', values: ['variant01','variant03','variant05','variant07','variant10','variant13','variant16','variant20','variant25']},
      {label: 'Olhos', optionKey: 'eyes', values: ['variant01','variant02','variant03','variant04','variant05']},
      {label: 'Lábios', optionKey: 'lips', values: ['variant01','variant04','variant07','variant10','variant13','variant16','variant20','variant24','variant28']},
      {label: 'Óculos', optionKey: 'glasses', toggleable: true, noneLabel: 'Nenhum', values: ['variant01','variant02','variant03','variant04','variant05','variant06','variant07','variant08','variant09','variant10','variant11']},
      {label: 'Barba', optionKey: 'beard', toggleable: true, noneLabel: 'Nenhum', values: ['variant01','variant02','variant03','variant04','variant05','variant06','variant07','variant08','variant09','variant10','variant11','variant12']},
    ],
    chipPickers: [],
  },
  bottts: {
    colorPickers: [
      {label: 'Cor do Robô', optionKey: 'baseColor', colors: BOTTTS_BASE},
    ],
    thumbPickers: [
      {label: 'Olhos', optionKey: 'eyes', values: ['bulging','dizzy','eva','frame1','frame2','glow','happy','hearts','robocop','round','roundFrame01','roundFrame02','sensor','shade01']},
      {label: 'Boca', optionKey: 'mouth', values: ['bite','diagram','grill01','grill02','grill03','smile01','smile02','square01','square02']},
      {label: 'Rosto', optionKey: 'face', values: ['round01','round02','square01','square02','square03','square04']},
      {label: 'Topo', optionKey: 'top', values: ['antenna','antennaCrooked','bulb01','glowingBulb01','glowingBulb02','horns','lights','pyramid','radar']},
      {label: 'Laterais', optionKey: 'sides', values: ['antenna01','antenna02','cables01','cables02','round','square','squareAssymetric']},
      {label: 'Textura', optionKey: 'texture', toggleable: true, noneLabel: 'Nenhum', values: ['camo01','camo02','circuits','dirty01','dirty02','dots','grunge01','grunge02']},
    ],
    chipPickers: [],
  },
  'pixel-art': {
    colorPickers: [
      {label: 'Cor do Cabelo', optionKey: 'hairColor', colors: PIXEL_ART_HAIR_COLOR},
      {label: 'Cor da Roupa', optionKey: 'clothingColor', colors: PIXEL_ART_CLOTHING_COLOR},
    ],
    thumbPickers: [
      {label: 'Cabelo', optionKey: 'hair', values: ['short01','short04','short08','short12','short16','short20','short24','long01','long05','long10','long15','long20']},
      {label: 'Roupa', optionKey: 'clothing', values: ['variant01','variant03','variant05','variant07','variant09','variant11','variant13','variant15','variant17','variant19','variant22']},
      {label: 'Olhos', optionKey: 'eyes', values: ['variant01','variant02','variant03','variant04','variant05','variant06','variant07','variant08']},
      {label: 'Boca', optionKey: 'mouth', values: ['happy01','happy03','happy06','happy10','sad01','sad03','sad05','sad08']},
      {label: 'Óculos', optionKey: 'glasses', toggleable: true, noneLabel: 'Nenhum', values: ['light01','light02','light03','dark01','dark02','dark03']},
      {label: 'Barba', optionKey: 'beard', toggleable: true, noneLabel: 'Nenhum', values: ['variant01','variant02','variant03','variant04','variant05','variant06','variant07','variant08']},
      {label: 'Chapéu', optionKey: 'hat', toggleable: true, noneLabel: 'Nenhum', values: ['variant01','variant02','variant03','variant04','variant05','variant06','variant07','variant08','variant09','variant10']},
    ],
    chipPickers: [],
  },
  'fun-emoji': {
    colorPickers: [
      {label: 'Cor de Fundo', optionKey: 'backgroundColor', colors: FUN_EMOJI_BG},
    ],
    thumbPickers: [
      {label: 'Olhos', optionKey: 'eyes', values: ['sad','tearDrop','pissed','cute','wink','wink2','plain','glasses','closed','love','stars','shades','closed2','crying','sleepClose']},
      {label: 'Boca', optionKey: 'mouth', values: ['plain','lilSmile','sad','shy','cute','wideSmile','shout','smileTeeth','smileLol','pissed','drip','tongueOut','kissHeart','sick','faceMask']},
    ],
    chipPickers: [],
  },
  thumbs: {
    colorPickers: [
      {label: 'Cor de Fundo', optionKey: 'backgroundColor', colors: THUMBS_BG},
      {label: 'Cor do Polegar', optionKey: 'shapeColor', colors: THUMBS_BG},
    ],
    thumbPickers: [
      {label: 'Expressão', optionKey: 'face', values: ['variant1','variant2','variant3','variant4','variant5']},
      {label: 'Olhos', optionKey: 'eyes', values: ['variant1W10','variant2W10','variant4W10','variant6W10','variant8W10']},
      {label: 'Boca', optionKey: 'mouth', values: ['variant1','variant2','variant3','variant4','variant5']},
    ],
    chipPickers: [],
  },
  initials: {
    colorPickers: [
      {label: 'Cor de Fundo', optionKey: 'backgroundColor', colors: INITIALS_BG},
    ],
    thumbPickers: [],
    chipPickers: [
      {label: 'Peso da Fonte', optionKey: 'fontWeight', options: [
        {value: 'none', label: 'Padrão'}, {value: '300', label: 'Leve'},
        {value: '400', label: 'Normal'}, {value: '600', label: 'Semi'},
        {value: '700', label: 'Negrito'}, {value: '900', label: 'Extra'},
      ]},
      {label: 'Fonte', optionKey: 'fontFamily', options: [
        {value: 'none', label: 'Padrão'}, {value: 'Arial', label: 'Arial'},
        {value: 'Verdana', label: 'Verdana'}, {value: 'Georgia', label: 'Georgia'},
        {value: 'Tahoma', label: 'Tahoma'}, {value: 'Helvetica', label: 'Helvetica'},
      ]},
    ],
  },
};

// Default options per style (toggleable features start as 'none' to prevent random appearance)
const STYLE_DEFAULTS: Partial<Record<DiceBearStyle, Record<string, string>>> = {
  avataaars: {accessories: 'none', facialHair: 'none'},
  micah: {glasses: 'none', facialHair: 'none', earrings: 'none'},
  lorelei: {glasses: 'none', beard: 'none', earrings: 'none'},
  adventurer: {glasses: 'none', earrings: 'none'},
  'open-peeps': {accessories: 'none', facialHair: 'none'},
  personas: {facialHair: 'none'},
  notionists: {glasses: 'none', beard: 'none'},
  bottts: {texture: 'none'},
  'pixel-art': {glasses: 'none', beard: 'none', hat: 'none'},
  'fun-emoji': {},
  thumbs: {},
  initials: {},
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function SectionLabel({children}: {children: string}) {
  return (
    <Text
      preset="paragraphSmall"
      color="textSecondary"
      bold
      mb="s8"
      style={{textTransform: 'uppercase', letterSpacing: 0.5}}>
      {children}
    </Text>
  );
}

interface ColorSwatchPickerProps {
  colors: Swatch[];
  selected?: string;
  onSelect: (value: string) => void;
}
function ColorSwatchPicker({colors, selected, onSelect}: ColorSwatchPickerProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingBottom: 4}}>
      {colors.map(({value, bg}) => (
        <TouchableOpacity key={value} onPress={() => onSelect(value)} activeOpacity={0.7}>
          <Box style={{
            width: 34, height: 34, borderRadius: 17,
            backgroundColor: bg,
            borderWidth: selected === value ? 3 : 1.5,
            borderColor: selected === value ? '#0B5D8A' : '#D1D5DB',
            marginRight: 10,
          }} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const THUMB_SIZE = 52;

interface AvatarThumbRowProps {
  values: string[];
  optionKey: string;
  style: DiceBearStyle;
  selected?: string;
  onSelect: (value: string) => void;
  svgMap: Record<string, string>;
  toggleable?: boolean;
  noneLabel?: string;
}
function AvatarThumbRow({values, optionKey, selected, onSelect, svgMap, toggleable, noneLabel}: AvatarThumbRowProps) {
  const noneSelected = toggleable && (selected === 'none' || selected === undefined);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingBottom: 4}}>
      {/* None option for toggleable */}
      {toggleable && (
        <TouchableOpacity key="none" onPress={() => onSelect('none')} activeOpacity={0.7}>
          <Box style={{
            borderWidth: noneSelected ? 2 : 1,
            borderColor: noneSelected ? '#0B5D8A' : '#E5E7EB',
            borderRadius: 12,
            backgroundColor: noneSelected ? '#EFF6FF' : '#F9FAFB',
            padding: 4, marginRight: 8,
            width: THUMB_SIZE + 8, height: THUMB_SIZE + 8 + 18,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Box width={THUMB_SIZE} height={THUMB_SIZE} alignItems="center" justifyContent="center">
              <Icon name="close" size={26} color={noneSelected ? 'primary' : 'textSecondary'} />
            </Box>
            <Text style={{fontSize: 10, color: noneSelected ? '#0B5D8A' : '#9CA3AF', textAlign: 'center', marginTop: 2}}>
              {noneLabel ?? 'Nenhum'}
            </Text>
          </Box>
        </TouchableOpacity>
      )}
      {/* Value options */}
      {values.map(value => {
        const isSelected = selected === value;
        return (
          <TouchableOpacity key={value} onPress={() => onSelect(value)} activeOpacity={0.7}>
            <Box style={{
              borderWidth: isSelected ? 2 : 1,
              borderColor: isSelected ? '#0B5D8A' : '#E5E7EB',
              borderRadius: 12,
              backgroundColor: isSelected ? '#EFF6FF' : '#F9FAFB',
              padding: 4, marginRight: 8, alignItems: 'center',
            }}>
              <SvgXml xml={svgMap[value] ?? ''} width={THUMB_SIZE} height={THUMB_SIZE} />
              {isSelected && (
                <Box position="absolute" style={{
                  top: 4, right: 4, backgroundColor: '#0B5D8A',
                  borderRadius: 8, width: 16, height: 16,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon name="check" size={10} color="surface" />
                </Box>
              )}
            </Box>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

interface ChipRowProps {
  options: {value: string; label: string}[];
  selected?: string; // undefined = 'none' chip is selected
  onSelect: (value: string) => void; // 'none' means delete key
}
function ChipRow({options, selected, onSelect}: ChipRowProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingBottom: 4}}>
      {options.map(({value, label}) => {
        const isSelected = value === 'none' ? selected === undefined : selected === value;
        return (
          <TouchableOpacity key={value} onPress={() => onSelect(value)} activeOpacity={0.7}>
            <Box style={{
              borderWidth: isSelected ? 2 : 1,
              borderColor: isSelected ? '#0B5D8A' : '#E5E7EB',
              borderRadius: 20,
              backgroundColor: isSelected ? '#EFF6FF' : '#F9FAFB',
              paddingHorizontal: 14, paddingVertical: 7,
              marginRight: 8,
            }}>
              <Text style={{
                fontSize: 12,
                color: isSelected ? '#0B5D8A' : '#6B7280',
                fontWeight: isSelected ? '600' : '400',
              }}>
                {label}
              </Text>
            </Box>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  currentAvatarUrl?: string | null;
  userName?: string | null;
  onConfirm: (dicebearUrl: string) => void;
  onClose: () => void;
}

export function AvatarEditorModal({visible, currentAvatarUrl, userName, onConfirm, onClose}: Props) {
  const initDiceBear = currentAvatarUrl ? parseDiceBearUrl(currentAvatarUrl) : null;
  const initialSeed = initDiceBear?.seed ?? (userName?.split(' ')[0] ?? randomSeed());

  const [selectedStyle, setSelectedStyle] = useState<DiceBearStyle>(initDiceBear?.style ?? 'avataaars');
  const [seed, setSeed] = useState(initialSeed);
  const [options, setOptions] = useState<Record<string, string>>(
    initDiceBear?.urlParams ?? STYLE_DEFAULTS[initDiceBear?.style ?? 'avataaars'] ?? {},
  );

  // ── Live preview ──────────────────────────────────────────────────────────
  const previewSvg = useMemo(
    () => generateDiceBearSvg(selectedStyle, seed, options),
    [selectedStyle, seed, options],
  );

  // ── Style thumbnails (changes with seed) ───────────────────────────────────
  const styleThumbs = useMemo(() => {
    const map: Record<string, string> = {};
    STYLES.forEach(({key}) => { map[key] = generateDiceBearSvg(key, seed, {}); });
    return map;
  }, [seed]);

  // ── Option thumbnails (lazy — only for current style) ─────────────────────
  const thumbMaps = useMemo(() => {
    const config = STYLE_CONFIG[selectedStyle];
    const maps: Record<string, Record<string, string>> = {};
    for (const picker of config.thumbPickers) {
      maps[picker.optionKey] = {};
      for (const value of picker.values) {
        maps[picker.optionKey][value] = generateDiceBearSvg(
          selectedStyle, THUMB_SEED, {[picker.optionKey]: value},
        );
      }
    }
    return maps;
  }, [selectedStyle]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleRandomize = useCallback(() => setSeed(randomSeed()), []);

  function handleStyleChange(newStyle: DiceBearStyle) {
    setSelectedStyle(newStyle);
    setOptions(STYLE_DEFAULTS[newStyle] ?? {});
  }

  function handleThumbSelect(optionKey: string, value: string) {
    setOptions(o => ({...o, [optionKey]: value}));
  }

  function handleColorSelect(optionKey: string, value: string) {
    setOptions(o => ({...o, [optionKey]: value}));
  }

  function handleChipSelect(optionKey: string, value: string) {
    if (value === 'none') {
      setOptions(o => {
        const next = {...o};
        delete next[optionKey];
        return next;
      });
    } else {
      setOptions(o => ({...o, [optionKey]: value}));
    }
  }

  const handleConfirm = useCallback(() => {
    onConfirm(buildDiceBearUrl(selectedStyle, seed, options));
  }, [selectedStyle, seed, options, onConfirm]);

  const config = STYLE_CONFIG[selectedStyle];
  const hasCustomization =
    config.colorPickers.length > 0 ||
    config.thumbPickers.length > 0 ||
    config.chipPickers.length > 0;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.5)'}} />

      <Box backgroundColor="background" style={{borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%'}}>
        {/* Handle */}
        <Box alignItems="center" paddingTop="s12" paddingBottom="s4">
          <Box width={40} height={4} backgroundColor="border" style={{borderRadius: 2}} />
        </Box>

        {/* Header */}
        <Box flexDirection="row" alignItems="center" justifyContent="space-between"
          paddingHorizontal="s20" paddingVertical="s12" borderBottomWidth={1} borderBottomColor="border">
          <Text preset="headingSmall" color="text" bold>Personalizar Avatar</Text>
          <TouchableOpacityBox onPress={onClose} padding="s4">
            <Icon name="close" size={24} color="textSecondary" />
          </TouchableOpacityBox>
        </Box>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 40}}>

          {/* ── Preview ── */}
          <Box alignItems="center" paddingVertical="s20">
            <Box style={{width: 120, height: 120, borderRadius: 60, overflow: 'hidden', borderWidth: 3, borderColor: '#0B5D8A', backgroundColor: '#EFF6FF'}}>
              <SvgXml xml={previewSvg} width={120} height={120} />
            </Box>
            <TouchableOpacityBox mt="s16" flexDirection="row" alignItems="center"
              backgroundColor="primaryBg" paddingHorizontal="s20" paddingVertical="s10"
              borderRadius="s20" onPress={handleRandomize}>
              <Icon name="shuffle" size={18} color="primary" />
              <Text preset="paragraphMedium" color="primary" bold ml="s8">Aleatório</Text>
            </TouchableOpacityBox>
          </Box>

          {/* ── Style grid ── */}
          <Box paddingHorizontal="s20" mb="s16">
            <SectionLabel>Estilo</SectionLabel>
            <Box flexDirection="row" flexWrap="wrap" style={{gap: 8}}>
              {STYLES.map(({key, label}) => {
                const isSelected = selectedStyle === key;
                return (
                  <TouchableOpacity key={key} activeOpacity={0.7} onPress={() => handleStyleChange(key)} style={{width: '30%'}}>
                    <Box borderRadius="s12" overflow="hidden" alignItems="center" paddingVertical="s8"
                      style={{borderWidth: isSelected ? 2 : 1, borderColor: isSelected ? '#0B5D8A' : '#E5E7EB', backgroundColor: isSelected ? '#EFF6FF' : '#fff'}}>
                      <Box style={{width: 52, height: 52, borderRadius: 26, overflow: 'hidden', backgroundColor: '#F3F4F6'}}>
                        <SvgXml xml={styleThumbs[key] ?? ''} width={52} height={52} />
                      </Box>
                      <Text preset="paragraphSmall" bold={isSelected} mt="s4"
                        style={{color: isSelected ? '#0B5D8A' : '#6B7280', textAlign: 'center', fontSize: 11}}>
                        {label}
                      </Text>
                      {isSelected && (
                        <Box position="absolute" style={{top: 5, right: 5, backgroundColor: '#0B5D8A', borderRadius: 9, width: 18, height: 18, alignItems: 'center', justifyContent: 'center'}}>
                          <Icon name="check" size={11} color="surface" />
                        </Box>
                      )}
                    </Box>
                  </TouchableOpacity>
                );
              })}
            </Box>
          </Box>

          {/* ── Customization ── */}
          {hasCustomization && (
            <Box paddingHorizontal="s20">
              <Box height={1} backgroundColor="border" mb="s16" />
              <Text preset="paragraphMedium" color="text" bold mb="s12">Personalizar</Text>

              {/* Color pickers */}
              {config.colorPickers.map(cp => (
                <Box key={cp.optionKey} mb="s16">
                  <SectionLabel>{cp.label}</SectionLabel>
                  <ColorSwatchPicker
                    colors={cp.colors}
                    selected={options[cp.optionKey]}
                    onSelect={v => handleColorSelect(cp.optionKey, v)}
                  />
                </Box>
              ))}

              {/* Thumb pickers */}
              {config.thumbPickers.map(tp => (
                <Box key={tp.optionKey} mb="s16">
                  <SectionLabel>{tp.label}</SectionLabel>
                  <AvatarThumbRow
                    values={tp.values}
                    optionKey={tp.optionKey}
                    style={selectedStyle}
                    selected={options[tp.optionKey]}
                    onSelect={v => handleThumbSelect(tp.optionKey, v)}
                    svgMap={thumbMaps[tp.optionKey] ?? {}}
                    toggleable={tp.toggleable}
                    noneLabel={tp.noneLabel}
                  />
                </Box>
              ))}

              {/* Chip pickers */}
              {config.chipPickers.map(cp => (
                <Box key={cp.optionKey} mb="s16">
                  <SectionLabel>{cp.label}</SectionLabel>
                  <ChipRow
                    options={cp.options}
                    selected={options[cp.optionKey]}
                    onSelect={v => handleChipSelect(cp.optionKey, v)}
                  />
                </Box>
              ))}
            </Box>
          )}

          {/* ── Confirm button ── */}
          <Box paddingHorizontal="s20" mt="s16">
            <TouchableOpacityBox backgroundColor="primary" borderRadius="s12" paddingVertical="s16"
              alignItems="center" flexDirection="row" justifyContent="center" onPress={handleConfirm}>
              <Icon name="check" size={20} color="surface" />
              <Text preset="paragraphMedium" color="surface" bold ml="s8">Usar este Avatar</Text>
            </TouchableOpacityBox>
          </Box>
        </ScrollView>
      </Box>
    </Modal>
  );
}
