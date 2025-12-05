import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm'
import { INotification, NotificationType } from '../../utils/Interface'

@Entity('notifications')
@Index(['user_id', 'createdAt'])
@Index(['user_id', 'isRead'])
export class Notification implements INotification {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    @Index()
    user_id: string

    @Column()
    title: string

    @Column('text')
    message: string

    @Column({
        type: 'varchar',
        default: NotificationType.INFO
    })
    type: NotificationType

    @Column({ default: false })
    isRead: boolean

    @CreateDateColumn()
    createdAt: Date

    @Column({ type: 'datetime', nullable: true })
    readAt?: Date
}
