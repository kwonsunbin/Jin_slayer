
# final_project: 眞 슬레이어
참된 개발자가 되기 위한 전투게임

## 7조 Member
- 권순빈
- 윤재휘
- 한상범

## Codesandbox link
https://codesandbox.io/s/zhen-seulreieo-l9136

## 스펙

- 온라인에서 플레이가 가능하다 
- 로그인, 회원가입  
- 10 * 10 맵  
- 캐릭터의 이동  
- 이동 시 필드별로 아무일도 일어나지 않음, 전투, 아이템 획득의 일이 일어남.
	- 이벤트
		- 시작점(start): (0,0) -> "학기의 시작점이다."
		- 몬스터(battle): 전투 -> "왠지 ${monster}가 나올 것 같은 그런 스산한 분위기가 느껴진다."
		- 보물상자(treasure): 아이템 획득 -> "보물상자를 발견! ${item}을 획득했다!"
		- 함정(trap): HP 감소 -> "함정에 빠졌다. HP ${??} 감소"
		- 쉼터(rest): HP 증가 -> "마음이 편안해진다. HP ${??} 회복"
		- 아무것도 아님(nothing): 꽝 -> "아무것도 없다."
		- 랜덤(random): 시작점을 제외한 이벤트 중 랜덤 발생
- Player
	- Level System 
		- 레벨 업: 체력 회복, maxHP++, str++, def++
		- level의 경험치 게이지: level * 20
	- Default
		- level: 1
		- exp: 0
		- maxHP: 10
		- HP: 10
		- str: 5
		- def: 5
		- x: 0
		- y: 0
		- inventory : []
- 5종 이상의 몬스터
	- codecademy(str: 4, def: 3, hp: 5, exp: 10)
	- 중간고사(str: 7, def: 4, hp: 6, exp: 15)
	- 코인거래소(str: 8, def: 3, hp: 7, exp: 20)
	- 머드게임(str: 9, def: 4, hp: 8, exp: 25)
	- 웹프로그래밍2(str: 10, def: 4, hp: 9, exp: 30)
- 5종 이상의 아이템 : 중복 착용 가능
	- 무기
		- 맥북(str: 1)
		- 구글(str: 2)
	- 장비
		- 커피(def: 1)
		- 에너지드링크(def: 2)
		- 개발자(def: 3)
- 전투 시스템(str, def, hp 개념을 활용)  
	- 번갈아가면서 STR만큼 공격 HP는 '받은 피해(STR) - DEF' 만큼 깎임
	- 패배
		- Player의 HP가 0이 되면 사망 
	- 승리
		- Monster의 HP가 0이 되면 경험치 획득
	- 무승부
		- turn이 10번째까지 간 경우
- 사망 시스템(전투 시 hp가 0이 될 경우 캐릭터, 가 사망. 0,0 위치로 이동)
	- Player의 inventory 중 랜덤으로 item을 잃어버린다.
		- item이 없는 경우
			"***사망하여 맥북 아이템을 잃어버렸습니다.(str 1 감소)***"
		- item이 있는 경우
			"***사망했는데 잃어버릴 아이템도 없습니다.***"

## 추가스펙

 - [x] 체력 회복하는 이벤트가 추가된다.
 - [x] 필드에서 일어나는 이벤트 중 랜덤이벤트가 존재한다.  
 - [x] 아이템을 소유할 경우, 캐릭터의 능력치가 향상된다. 능력치가 클라이언트에서 확인이 가능하다.
 - [x] 사망시 랜덤하게 아이템을 잃어버린다.  
 - [x] 유저의 인벤토리가 클라이언트 상에서 확인이 가능하다.
 - [ ] 시작 능력치가 랜덤하게 주어지며, 5번에 한하여 재시도가 가능하다. 
 - [ ] 전투 중, 10턴 안에 전투가 끝나지 않거나, 체력이 20% 이하로 감소할 경우 도망가는 선택지가 추가로 주어진다.

## 진행과정
- 권순빈: Git Repo 파기 및 기본스펙 구현
- 윤재휘: 로직 단위 작업, CodeSandbox Upload
- 한상범: 추가스펙 구현 및 리팩토링

## Trouble Shooting
1. Index.js에서의 Event Handling
	- 문제
		- index.js의 app.post('/action')에서 모든 이벤트에 관한 로직을 다루는 것이 가독성이 떨어지고 추가스펙 구현하는 것에 있어서 보수작업에 어려움을 겪었다.
	- 해결방법
		- eventUtils.js 파일을 만들어 해당 event 처리 및 그에 해당하는 Script를 만들어 return하도록 함수들을 구분하였다. 아래 함수들을 index.js에서 호출하여 사용하였다.
			- battleEvent
			- treasureEvent
			- trapEvent
			- restEvent
			- randomEvent
			- dieEvent

2. 사망 시, 화면에 표시되는 Script와 현재 위치 동기화 문제
	- 문제
		- Battle/Trap Event에서 사망한 경우, 해당 Event 스크립트를 보여주며 위치는 (0,0)으로 가야하는데 동기화를 시키지 못하고 있던 문제가 있었다.
	- 해결방법
		- index.js의 app.post('/action')에서 이동한 위치의 Field를 가져와 Event 핸들링을 하고 사망한 경우 dieEvent가 호출 되는데 함수 내에서 player의 위치를 (0,0)으로 업데이트 해준다. 그 다음에 response를 보낼 때, player의 (x,y)에 해당하는 Field를 가져와 parameter로 세팅해준다. 
		- 사망하지 않은 경우에는 앞서 이동한 위치에 해당하는 Field가 그대로 response로 넘어갈 것이고, 사망했을 경우에만 이동한 위치가 아닌 시작점(0,0)에 해당하는 Field가 넘어간다.
	
	
## Event Example
- 시작점(start)
	![start](https://photos.app.goo.gl/o9MYAEiPkxGk58xm7)
- 몬스터(battle)
	승리
	패배
- 보물상자(treasure)
	하나
- 함정(trap)
	사망, hp 감소
- 쉼터(rest)
	hp증가
- 아무것도 아님(nothing)
	- 1
- 랜덤(random)
