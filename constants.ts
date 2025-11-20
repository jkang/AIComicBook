
import { ComicPanelData } from './types';

const STYLE_BASE = "comic book art style, retro-futuristic 2050 China aesthetics, cel-shaded, intricate details, atmospheric lighting, 4k resolution.";
const CHAR_XIAODONG = "Zhou Xiaodong (young Chinese man, late 20s, messy black hair, wearing a worn grey mechanic jumpsuit and a utility belt)";
const CHAR_TIEDAN = "Tiedan (a rusty mechanical robotic rooster with glowing optical lenses)";
const CHAR_XIAOZHI = "Xiaozhi (a holographic AI avatar, glowing blue orb with a cute digital face)";
const CHAR_CHEN = "Chen Xiao (sleek elite man in a pristine white high-tech suit, rimless glasses)";

// Export for use in default story
export const DEFAULT_VISUAL_STYLE = STYLE_BASE;
export const DEFAULT_CHARACTERS = [CHAR_XIAODONG, CHAR_TIEDAN, CHAR_XIAOZHI, CHAR_CHEN];

export const COMIC_PANELS: ComicPanelData[] = [
  {
    id: 1,
    text: `2050年7月17日，清晨四点半。铁蛋打鸣像锯木头，一声高一声低。AI管家小智的奶糖音正准备响起——“检测到噪音污染，是否启用高频驱鸟模——”话没说完，国家预警广播突兀地插进来：“X9.8级太阳耀斑爆发，27分钟后抵达地球……”小智咯地一声卡住。屋里的灯闪了两下，灭了。`,
    imagePrompt: `${STYLE_BASE} Bedroom scene, dim lighting. ${CHAR_TIEDAN} is perched on a window sill, beak open crowing. ${CHAR_XIAOZHI} floating in the air is glitching and distorting, turning into static. A holographic warning sign in the background displays English text "WARNING: SOLAR FLARE DETECTED". The room lights are flickering out. Dark blue and emergency red color palette.`
  },
  {
    id: 2,
    text: `纳米制冷系统发出一声悠长的叹息。铁蛋正啄着智能喂食器，机器忽然哑了，漏出一地谷粒。它愣了一下，随即大喜过望。二狗对着窗外的黑暗乱叫，尾巴一甩一甩。三花趴在窗台上，眯着眼看对面楼的灯一盏盏熄灭——那神情，像在确认世界是不是也终于断电了。`,
    imagePrompt: `${STYLE_BASE} Close up low angle shot. ${CHAR_TIEDAN} is happily eating spilled grain from a broken high-tech dispenser. In the background, a robotic dog is barking at a window. A calico cat sits on the sill looking out at a city skyline where lights are going out one by one. Cyberpunk city plunging into darkness.`
  },
  {
    id: 3,
    text: `周小东坐起来，挠挠头。窗外，小城陷入滑稽的寂静。对面楼的老张端着AI泡的茶，底座不加热了，被烫得原地跺脚。楼下无人驾驶清洁车停在马路正中。“嘿，”周小东乐了，“这算不算共产主义的小bug？”`,
    imagePrompt: `${STYLE_BASE} ${CHAR_XIAODONG} sitting up in bed, scratching his messy hair, looking amused. Through the window, we see a street view below: an autonomous street sweeper robot halted in the middle of the road. An old neighbor on a balcony across the street looks confused holding a cold cup of tea. Dawn lighting.`
  },
  {
    id: 4,
    text: `周小东一点都不慌。他爸周强是典型的七十年代人，信奉“人定胜天”和“鸡娃改命”。可周小东不爱念书，他爱的是鼓捣爸爸的工具箱——拆变压器模型、绕线圈、用万用表测家里每个插座的电压。每次被逮住，都是一顿暴揍：“没出息的东西！读书读成个废物！”`,
    imagePrompt: `${STYLE_BASE} Flashback scene, sepia tone. A young boy version of ${CHAR_XIAODONG} is sitting on the floor surrounded by old electrical components, copper wires, and a multimeter. An angry shadow of a father figure looms over him. Retro electronics everywhere.`
  },
  {
    id: 5,
    text: `周小东从二本院校毕业后，六大AI集团已接管一切。他这种无业游民每月领8000元AI低保，饿不死，也富不了。慌什么呢？地里的黄瓜还在长，鸡还在下蛋，狗还认他这个主人。他早就被世界遗忘惯了，这会儿不过是世界陪他一起被遗忘。`,
    imagePrompt: `${STYLE_BASE} Wide shot of a rooftop garden in a futuristic city. ${CHAR_XIAODONG} is watering real cucumber plants. ${CHAR_TIEDAN} the robotic rooster is nearby. In the background, massive futuristic AI towers loom, contrasting with his humble rooftop garden. Relaxed atmosphere.`
  },
  {
    id: 6,
    text: `下午三点，小区智能屏弹出呼叫。画面里，小东高中的班主任王老师眼镜歪戴着：“小东！出事了！咱这片区的运维工程师心梗倒了！现在全疆十七个应急点，就剩咱这没启起来！” 王老师现在是小城的能源副署长。`,
    imagePrompt: `${STYLE_BASE} Close up of a glitchy wall-mounted smart screen. On the screen is a middle-aged Chinese man with glasses askew, looking panicked and sweating. He is wearing a government uniform. English text on screen UI: "EMERGENCY CALL".`
  },
  {
    id: 7,
    text: `王老师身后还有两人：陈骁，高考730分的神话，现在是“伏羲2050World”首席算法架构师；张维理，知名大学博导。小东愣了愣，沉默三秒，转身进屋：“我去找工具箱。”`,
    imagePrompt: `${STYLE_BASE} Split panel. Left side: On the screen, ${CHAR_CHEN} looking arrogant in a suit, standing next to an academic-looking older man. Right side: ${CHAR_XIAODONG} walking away from the screen into a dark room, reaching for a dusty, old-fashioned red toolbox.`
  },
  {
    id: 8,
    text: `市政府地下三层，机房门一开，霉味扑面而来。2032年的设备像群被遗忘的老人。陈骁看到主控台，喃喃自语：“二十年了，它在等一艘永远不会来的船。”张维理扶住机柜：“从理论上讲，先启动A7节点，再B3……但具体哪个是A7……”`,
    imagePrompt: `${STYLE_BASE} Underground server room, dusty and dimly lit by flashlights. Rows of bulky, old-fashioned 2030s server racks. ${CHAR_CHEN} looks disgusted, covering his nose. ${CHAR_XIAODONG} looks interested. An older professor is squinting at a label on a server rack.`
  },
  {
    id: 9,
    text: `周小东走到主变压器前，伸手摸向机械断路器。那是个铸铁大家伙。陈骁喊：“等等！先确认架构……”“确认个屁，”周小东咬牙，“它发烧了。”他指着闸刀根部发蓝的痕迹，抄起干粉灭火器噗噗喷了两下。`,
    imagePrompt: `${STYLE_BASE} Action shot. ${CHAR_XIAODONG} is holding a fire extinguisher, spraying white powder onto a large, overheating industrial circuit breaker. ${CHAR_CHEN} is in the background reaching out a hand to stop him, looking shocked. Smoke and powder in the air.`
  },
  {
    id: 10,
    text: `第一次合闸，力气不够，闸刀弹回来，一串电弧溅在他手背上。陈骁吓得要放弃。周小东抹了把脸，眼眶有点红，“我爸说，电这东西你怕它，它就欺负你。”他抄起绝缘棒，别住闸刀，全身一压，“咔哒”一声，闸刀咬死了。`,
    imagePrompt: `${STYLE_BASE} Intense close-up. ${CHAR_XIAODONG}, sweating and gritting his teeth, uses a long yellow insulation rod to force a heavy metal switch lever down. Sparks (blue electric arcs) are flying near his hands. Dramatic lighting highlighting his effort.`
  },
  {
    id: 11,
    text: `真正的麻烦在核心控制器。2032年的AI依赖STM32芯片，备用芯片有，但固件得重烧，烧录器是USB-A接口，驱动只认Win10。周小东从工具箱翻出一台2030年的ThinkPad X1。开机，Win10，完美。陈骁眼睛直了：“这……这是哪个上古文明的UI？”`,
    imagePrompt: `${STYLE_BASE} Close up on a table. An old, thick ThinkPad laptop is open, displaying the Windows 10 desktop logo. ${CHAR_XIAODONG}'s hands are plugging a USB cable into it. ${CHAR_CHEN} is staring at the screen with a mix of confusion and horror, as if looking at an alien artifact.`
  },
  {
    id: 12,
    text: `烧录出问题了——芯片的Q值表需要手动初始化。陈骁发呆：“我……十年没手写过算法了。”周小东叹气，抢过键盘。他爸笔记里夹着一张手绘的电网负载优先级图。他凭这张图反推出Q值初始权重，写得像鸡刨地。`,
    imagePrompt: `${STYLE_BASE} Over-the-shoulder shot. ${CHAR_XIAODONG} is typing furiously on the laptop. Next to the laptop is a yellowed, crinkled piece of paper with hand-drawn circuit diagrams and numbers. ${CHAR_CHEN} stands behind him, looking useless and bewildered.`
  },
  {
    id: 13,
    text: `最难的是同步启动。三个节点，间隔15秒，误差±0.5秒。没有示波器，只有一块2032年的机械秒表。“我来。”周小东站到主控台前，一手按启动钮，一手捏秒表。他深吸一口气，想起他爸修变压器时的样子。`,
    imagePrompt: `${STYLE_BASE} Tension scene. Focus on ${CHAR_XIAODONG}'s hands. One hand hovers over a big red physical button on a control panel, the other hand holds an old silver mechanical stopwatch. His face is focused and calm. Background is out of focus.`
  },
  {
    id: 14,
    text: `“准备——A7！”啪！“十五——B3！”第二个节点活了。“三十——C9！”最后一个按钮按下，整个机房的灯齐刷刷亮了。屏幕绿字跳动：“边疆一号系统启动成功。”陈骁瘫在地上：“我操，这比训练大模型还刺激。”`,
    imagePrompt: `${STYLE_BASE} Bright light floods the room. Overhead fluorescent lights are ON. Computer screens on the walls turn green with English text "SYSTEM ONLINE". ${CHAR_XIAODONG} is exhaling in relief. ${CHAR_CHEN} is sitting on the floor, leaning against a rack, looking exhausted and sweaty.`
  },
  {
    id: 15,
    text: `接下来的两天，小城活过来了，用的是笨办法。路灯定时开关，医院挂号机变成抽签筒。铁蛋在院子里刨食，二狗追真老鼠，三花抓了只麻雀叼回来。周小东坐在门槛上，点蜡烛，用铅笔记账，写得歪歪扭扭，像他爸。`,
    imagePrompt: `${STYLE_BASE} Night scene, peaceful. ${CHAR_XIAODONG} sits on a doorstep lit by candlelight, writing in a notebook with a pencil. ${CHAR_TIEDAN} the robotic rooster is nearby. The streetlights in the distance are on. A simple, analog feeling in a high-tech world.`
  },
  {
    id: 16,
    text: `72小时后，系统恢复。周小东账户多了100万奖金。他用奖金买了一套2032年老工具，放在父亲工具箱旁。但他兴冲冲想改装智能插座时，却发现连电阻色环都认不全了。`,
    imagePrompt: `${STYLE_BASE} Interior workshop. A brand new set of high-quality hand tools (screwdrivers, pliers) is arranged neatly next to the old rusty red toolbox. ${CHAR_XIAODONG} is holding a small resistor, looking at it with a puzzled expression, scratching his head.`
  },
  {
    id: 17,
    text: `工具箱第三天就被小智自动收纳，理由是“检测到超过180天未使用”。他点了“同意”。他把“小智”调成沉默模式，但第二天铁蛋没准时吃到早餐，追着二狗啄。他只好又把声音调回来。`,
    imagePrompt: `${STYLE_BASE} Living room. A domestic robot arm is putting the red toolbox into a storage cabinet. ${CHAR_XIAODONG} watches passively, holding a holographic interface panel, pressing a button. ${CHAR_TIEDAN} is pecking at a robotic dog in the background.`
  },
  {
    id: 18,
    text: `一周后，邻居大妈通过智能屏呼叫小东：“小东，听说你上次让机器听人话了？我家这败家玩意儿卡住啦！”“您找AI客服啊。”他懒洋洋挥手。他低头看自己的手，那双手刚扶过重闸刀，写过像鸡刨地的代码。`,
    imagePrompt: `${STYLE_BASE} Interior home scene, day. A wall-mounted smart display screen shows a video call interface: an elderly neighbor lady appears on the screen, looking anxious and shouting. ${CHAR_XIAODONG} stands in the foreground, turning his back to the screen and waving his hand dismissively over his shoulder. He is looking down at his own open palms with a deep, contemplative expression, examining his hands.`
  },
  {
    id: 19,
    text: `他想起那72小时里，铁蛋啄的是真谷粒，二狗追的是真老鼠。现在一切都回来了。只有他手里还攥着父亲的电工笔记。他翻开，里面夹着张纸条，铅笔写着：123456。下面还有一行他爸的字迹：“太聪明的东西，记不住的咱就别记。”`,
    imagePrompt: `${STYLE_BASE} Close up top-down shot. ${CHAR_XIAODONG}'s hands holding an old, worn notebook open. On the paper, handwritten in pencil, is the number "123456" and some Chinese characters. The lighting is warm and nostalgic.`
  },
];
