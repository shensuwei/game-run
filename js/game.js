// 创建人物对象
function person(canvas,cobj,runImg,jumpImg){
	this.canvas=canvas;
	this.cobj=cobj;
	this.runImg=runImg;
	this.jumpImg=jumpImg;

	this.state="runImg"; //跑、跳、走
	this.status=0;  //第几种状态

	// runImg在画布中的大小
	this.width=83;
	this.height=118;

	// 人物在画布中的位置
	this.x=0;
	this.y=0;

	this.endy=320; //定义人物跳起再下落最终最低落在什么位置
	this.speedy=5;  //定义人物跳起时纵向上升的速度
	this.zhongli=10;  //定义人物跳起下落时的重力加速度
}

person.prototype={
	draw:function(){
		// 保存2d对象的原始状态(保存当前环境的状态)
		this.cobj.save();

		// 将人物平移到指定位置(重新映射画布上的 (0,0) 位置)
		this.cobj.translate(this.x,this.y);

		this.cobj.drawImage(this[this.state][this.status],0,0,827,1181,0,0,this.width,this.height);
		
		// 恢复2d对象的原始状态(返回之前保存过的路径状态和属性)
		this.cobj.restore();
	},
	update:function(){
		// 人在跳时需要做出的一些改变
		if(this.y>this.endy){
			this.y=this.endy;
			stone(this.cobj,this.x+this.width/2,this.y+this.height);
		}else if(this.y<this.endy){
			this.speedy+=this.zhongli;
			this.y+=this.speedy;
		} 
		
	}
}

// 创建游戏对象
function game(canvas,cobj,runImg,jumpImg,hinderImg){
	this.canvas=canvas;
	this.cobj=cobj;
	this.runImg=runImg;
	this.jumpImg=jumpImg;
	this.hinderImg=hinderImg;
	this.hinderArr=[]; //创建障碍物数组

	this.person=new person(canvas,cobj,runImg,jumpImg);
	this.speed=5;  //游戏进行的速度

	this.life=3;  //生命值
	this.score=1;  //分数
}

game.prototype={
	play:function(){
		var that=this;

		// 玩游戏时调用key方法
		that.key();

		var num=0;  //定义人物是第几种状态
		var bg=0;   //定义背景图片的位置
		
		// 规定障碍物5-10s出一个
		var step=5000+parseInt(5*Math.random())*1000;
		var num2=0;  //控制画面中最多有5个障碍物

		setInterval(function(){
			num++;  //更换状态
			bg-=that.speed;  //背景一直往左移

			// 清空画布，否则会出现多个人重叠在一起
			that.cobj.clearRect(0,0,that.canvas.width,that.canvas.height);

			if(that.person.state=="runImg"){
				that.person.status=num%8;
			}else if(that.person.state=="jumpImg"){
				that.person.status=0;	
			}

			// 通过speed使人在x轴方向上的位置发生改变
			that.person.x+=that.speed;
			
			// 边界判断
			if(that.person.x>that.canvas.width/2){
				that.person.x=that.canvas.width/2;
			}

			that.person.draw(); // 绘制人物
			that.person.update();  //人物上下跳动时不要越界

			// 人物到达一定位置停止，让背景画布动起来
			that.canvas.style.backgroundPositionX=bg+"px";
			

			// 障碍物设置
			if(num2%step==0){
				num2=0;
				step=5000+parseInt(5*Math.random())*1000;
				
				// 创建障碍物对象
				var hinderObj=new hinder(that.canvas,that.cobj,that.hinderImg);

				// 让障碍物随机出现
				hinderObj.status=Math.floor(that.hinderImg.length*Math.random());
			
				// 将创建的障碍物对象放入数组中
				that.hinderArr.push(hinderObj);

				if(that.hinderArr.length>5){
					// 删除数组的第一个元素
					that.hinderArr.shift();
				}
			}

			num2+=50;

			// 将障碍物放入页面中
			for(var i=0;i<that.hinderArr.length;i++){
				// 将障碍物画入页面中
				that.hinderArr[i].draw();

				// 让障碍物运动起来
				that.hinderArr[i].x-=that.speed;

				// 处理碰撞问题
				if(hitPix(that.canvas,that.cobj,that.person,that.hinderArr[i])){
					// 撞到障碍物的情况(减生命值)
					// that.hinderArr[i].flag1-->控制障碍物何时出现
					if(!that.hinderArr[i].flag1){
						that.life--;

						// 调用石头函数
						stone(that.cobj,that.person.x+that.person.width/2,that.person.y+that.person.height/2,"red");
					}
					that.hinderArr[i].flag1=true;
					
					if(that.life<0){
                        alert("game over");
                        location.reload();
                    }

				}else if(that.hinderArr[i].width+that.hinderArr[i].x<that.person.x){
					// 没撞到时的情况(加分)
					if(!that.hinderArr[i].flag&&!that.hinderArr[i].flag1){
						document.title=++that.score;
						if(that.score%3==0){
                            that.speed+=1;
                        }
					}
					that.hinderArr[i].flag=true;
				}
			}

		},50);
		
	},
	key:function(){
		var that=this;

		var flag=true;  //控制跳完一次回到原位后再起跳
		document.onkeydown=function(e){
			if(!flag){
				return;
			}
			flag=false;
			var code=e.keyCode;
			if(code==32){
				that.person.state="jumpImg";

				// 要与三角函数相结合
				var initA=0;  //人跳跃时的初始角度
				var speedA=10;  //角度变化值
				var r=100;  //人物上下跳动的半径
				var initY=that.person.y;  //人物跳之前的初始位置
				var t=setInterval(function(){
					initA+=speedA;  //角度变化
					if(initA>180){
						// 清除进程
						clearInterval(t);
						// 让人物回到起跳的位置
						that.person.y=initY;
						// 人物状态更换
						that.person.state="runImg";

						flag=true;
					}else{
						// 人物距起始点的距离
						var len=Math.sin(initA*Math.PI/180)*r;
						that.person.y=initY-len;
					}
				},50);
			}
			
		}
	}
}

// 创建障碍物对象
function hinder(canvas,cobj,hinderImg){
	this.canvas=canvas;
	this.cobj=cobj;
	this.hinderImg=hinderImg;
	this.status=0;  //默认第一个出现的是第一个障碍物

	this.x=canvas.width;
	this.y=400;
	this.width=56;
	this.height=40;
}

hinder.prototype={
	draw:function(){
		this.cobj.save();
		this.cobj.translate(this.x,this.y);
		this.cobj.drawImage(this.hinderImg[this.status],0,0,564,399,0,0,this.width,this.height);
		this.cobj.restore();
	}
}

// 创建粒子对象
function fire(cobj){
	this.cobj=cobj;
	this.x=0;
	this.y=0;
	this.x1= 20 * Math.random() - 10;
	this.y1= 20 * Math.random() - 10;
	this.x2= 20 * Math.random() - 10;
	this.y2= 20 * Math.random() - 10;
	this.speedy=-2*Math.random()-2;
	this.speedx=(16 * Math.random() - 8);
	this.life=4;
	this.r=1;
	this.color="#fef";
}
fire.prototype={
	draw:function(){
		var cobj=this.cobj;
		cobj.save();
		cobj.beginPath();
		cobj.fillStyle=this.color;
		cobj.translate(this.x,this.y);
		cobj.scale(this.r,this.r);
		cobj.moveTo(0,0);
		cobj.lineTo(this.x1,this.y1);
		cobj.lineTo(this.x2,this.y2);
		cobj.fill();
		cobj.restore();
	},
	update:function(){
		this.x+=this.speedx;
		this.y+=this.speedy;
		this.life-=0.2;
		this.r-=0.06;
	}
}

// 创建石头
function stone(cobj,x,y,color){
	var color=color||"#fff";
	var stoneArr=[];
	for(var i=0;i<5;i++){
		// 创建粒子
		var obj=new fire(cobj);
		obj.x=x;
		obj.y=y;
		obj.color=color;
		stoneArr.push(obj);
	}

	var t=setInterval(function(){
		for(var i=0;i<stoneArr.length;i++){
			stoneArr[i].draw();
			stoneArr[i].update();
			if(stoneArr[i].r<0||stoneArr[i].life<0){
				stoneArr.splice(i,1);
			}
		}

		if(stoneArr.length==0){
			clearInterval(t);
		}
	},50);
}



