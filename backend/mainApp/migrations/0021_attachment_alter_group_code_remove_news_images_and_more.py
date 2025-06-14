# Generated by Django 5.1.7 on 2025-05-18 15:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mainApp', '0020_field_isactive_alter_group_code_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Attachment',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('file', models.ImageField(upload_to='attachments/', verbose_name='Attachment')),
                ('file_type', models.CharField(choices=[('PHOTO', 'photo'), ('VIDEO', 'video')], max_length=10, verbose_name='File type')),
            ],
        ),
        migrations.AlterField(
            model_name='group',
            name='code',
            field=models.CharField(default='rBQ9B8xNQO32xgpWUnMox4tpdwYnsbVK', max_length=300),
        ),
        migrations.RemoveField(
            model_name='news',
            name='images',
        ),
        migrations.AddField(
            model_name='news',
            name='images',
            field=models.ManyToManyField(to='mainApp.attachment'),
        ),
    ]
