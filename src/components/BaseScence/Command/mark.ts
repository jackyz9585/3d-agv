import Base from '@BaseScence/Command/base'
import * as THREE from 'three'
import scene from '@BaseScence/Command/scene/index'
import breathingLight from '@BaseScence/Command/scene/breathingLight'
import { FloorData } from './types/floor'
class Mark extends Base {
  constructor() {
    super()
  }
  // 绘制文字
  drawTextByGroup({
    groupId,
    geometryConfig,
  }: {
    groupId: string
    geometryConfig: FloorData
  }) {
    const group = scene.getGroupByIndex(scene.scene, groupId)
    const texts = geometryConfig.texts
    texts.forEach((t) => {
      const { x, z } = t.size
      const { px, pz } = t.pos
      //绘制吊牌
      //创建精灵材质对象SpriteMaterial
      const texture = new THREE.CanvasTexture(
        this.createTextCanvas(t.name, x, z, t.style)
      )
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture, //设置精灵纹理贴图
      })
      // 创建精灵模型对象，不需要几何体geometry参数
      const sprite = new THREE.Sprite(spriteMaterial)
      sprite.scale.set(x, z)

      // 生成z坐标 更靠近画面为正向，正向放在140  负向放在-100
      let cz = 0
      if (pz > 0) {
        cz = t.textLeft
      } else {
        cz = t.textRight
      }
      // 生成20-80的高度随机数
      const height = 60
      // 扣减2px作为吊牌拐点
      const inflection = 2
      sprite.position.set(px, height - inflection, cz)
      group.add(sprite)

      // 画点
      const p1 = new THREE.Vector3(px, 0, pz) //底部开始节点
      const p2 = new THREE.Vector3(px, height + z / 2, pz)
      const p3 = new THREE.Vector3(px, height + z / 2, cz) //链接吊牌的结束节点
      const p4 = new THREE.Vector3(px, height + z / 2 - inflection, cz) //链接吊牌的结束节点

      // 画线
      const line1 = new THREE.LineCurve3(p1, p2)
      const line2 = new THREE.LineCurve3(p2, p3)
      const line3 = new THREE.LineCurve3(p3, p4)

      const curvePath = new THREE.CurvePath()
      curvePath.curves.push(line1, line2, line3)
      const geometry = new THREE.TubeGeometry(curvePath, 100, 0.4, 100, false) //0.5为粗细
      const material = new THREE.MeshPhongMaterial({
        color: t.style.background, //管道线条颜色
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.name = `mark-${t.name}`
      group.add(mesh) //线条对象添加到场景中
      breathingLight.breathingMeshes.push(mesh)
    })
  }
  // 生成挂牌canvas
  createTextCanvas(content, x, z, style) {
    const canvas = document.createElement('canvas')
    // 增加了画布缩放系数，让文字在保持清晰
    const scale = 10
    // 留给外发光的边距
    const rangeOut = 20
    canvas.width = x * scale + rangeOut
    canvas.height = z * scale + rangeOut
    const cxt = canvas.getContext('2d') as CanvasRenderingContext2D
    // 画背景
    cxt.fillStyle = '#0000003b'
    cxt.fillRect(
      rangeOut / 2,
      rangeOut / 2,
      canvas.width - rangeOut,
      canvas.height - rangeOut
    )
    // 画边框
    cxt.strokeStyle = style.background
    cxt.lineWidth = 5
    cxt.shadowColor = style.background
    // 阴影加重
    cxt.shadowBlur = 10
    cxt.strokeRect(
      rangeOut / 2,
      rangeOut / 2,
      canvas.width - rangeOut,
      canvas.height - rangeOut
    )

    cxt.shadowBlur = 20
    cxt.strokeRect(
      rangeOut / 2,
      rangeOut / 2,
      canvas.width - rangeOut,
      canvas.height - rangeOut
    )

    // cxt.lineWidth = 5;
    // cxt.strokeStyle = 'red';
    //   cxt.strokeRect(0, 0, canvas.width - 4, canvas.height - 1);

    // 写字

    cxt.fillStyle = style.color
    const fontSize = Number(style.fontSize)
    cxt.font = `${fontSize}px Arial`
    cxt.textBaseline = 'middle'
    cxt.textAlign = 'center'

    cxt.shadowColor = style.color
    cxt.shadowBlur = 10
    // cxt.shadowOffsetX = 10;
    // cxt.shadowOffsetY = 10;

    cxt.fillText(content, canvas.width / 2, canvas.height / 2)
    return canvas
  }
}

export default new Mark()
