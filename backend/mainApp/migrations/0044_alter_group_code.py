# Generated by Django 5.1.7 on 2025-06-03 22:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mainApp', '0043_alter_group_code_alter_likepost_post'),
    ]

    operations = [
        migrations.AlterField(
            model_name='group',
            name='code',
            field=models.CharField(default='GzpsLrxXLWWNb6BGQDMLhjnWTYgycY1R', max_length=300),
        ),
    ]
