/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("administrativo-acesso-usuarios", []) 

.controller("administrativo-acesso-usuariosCtrl", ['$scope',
                                            '$state',
                                            '$http',
                                            '$campos',
                                            '$webapi',
                                            '$apis',
                                            '$filter', 
                                            function($scope,$state,$http,$campos,
                                                     $webapi,$apis,$filter){ 
   
    var divPortletBodyLogsPos = 0; // posição da div que vai receber o loading progress
    $scope.paginaInformada = 1; // página digitada pelo privilégio
    $scope.logs = [];
    $scope.camposBusca = [{
                            id: $campos.administracao.webpagesroles.RoleName,
                            ativo: true,  
                            nome: "Privilégio"
                          }];
    $scope.itens_pagina = [10, 20, 50, 100];
    $scope.filtro = {busca:'', campo_busca : $scope.camposBusca[0], 
                      itens_pagina : $scope.itens_pagina[0], pagina : 1,
                      total_registros : 0, faixa_registros : '0-0', total_paginas : 0, 
                      campo_ordenacao : {id: 100, order : 0}};    
    
 
                                                
    // Inicialização do controller
    $scope.administrativoAcessoUsuariosInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Logs';                          
        $scope.pagina.subtitulo = 'Acesso de Usuários';
        // Busca Privilégios
        //$scope.buscaPrivilegios();
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });  
    }; 
                                            
    // ORDENAÇÃO
    /**
      * Modifica a ordenação
      */
    var ordena = function(posCampo){
        if(posCampo >= 0 && posCampo < $scope.camposBusca.length){
            if($scope.filtro.campo_ordenacao.id !== $scope.camposBusca[posCampo].id){ 
                $scope.filtro.campo_ordenacao.id = $scope.camposBusca[posCampo].id;
                $scope.filtro.campo_ordenacao.order = 0; // começa descendente                                 
            }else
                // Inverte a ordenação: ASCENDENTE => DESCENDENTE e vice-versa                                
                $scope.filtro.campo_ordenacao.order = $scope.filtro.campo_ordenacao.order === 0 ? 1 : 0;                                
            $scope.buscaPrivilegios(); 
        }
    };
    /**
      * Ordena por nome
      */
    $scope.ordena = function(){
        ordena(0);    
    }
    /**
      * Retorna true se a ordenação está sendo feito por nome de forma crescente
      */
    $scope.estaOrdenadoCrescente = function(){
        return $scope.filtro.campo_ordenacao.id === $scope.camposBusca[0].id && 
               $scope.filtro.campo_ordenacao.order === 0;    
    };
    /**
      * Retorna true se a ordenação está sendo feito por nome de forma decrescente
      */
    $scope.estaOrdenadoDecrescente = function(){
        return $scope.filtro.campo_ordenacao.id === $scope.camposBusca[0].id && 
               $scope.filtro.campo_ordenacao.order === 1;    
    };                          
                                            
                                            
                                                
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.filtro.total_paginas){ 
           $scope.filtro.pagina = pagina;
           $scope.buscaPrivilegios(); 
       }
       $scope.atualizaPaginaDigitada();    
    };
    /**
      * Vai para a página anterior
      */
    $scope.retrocedePagina = function(){
        setPagina($scope.filtro.pagina - 1); 
    };
    /**
      * Vai para a página seguinte
      */                                            
    $scope.avancaPagina = function(){
        setPagina($scope.filtro.pagina + 1); 
    };
    /**
      * Foi informada pelo usuário uma página para ser exibida
      */                                            
    $scope.alteraPagina = function(){
        if($scope.paginaInformada) setPagina(parseInt($scope.paginaInformada));
        else $scope.setaPaginaDigitada();  
    };
    /**
      * Sincroniza a página digitada com a que efetivamente está sendo exibida
      */                                            
    $scope.atualizaPaginaDigitada = function(){
        $scope.paginaInformada = $scope.filtro.pagina; 
    };                                             
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
        $scope.buscaPrivilegios();   
    };
     
    // BUSCA
    $scope.filtraPrivilegios = function(filtro){
        $scope.filtro.busca = filtro;
        $scope.buscaPrivilegios();
    };
    $scope.buscaPrivilegios = function(){
       $scope.showProgress(divPortletBodyLogsPos);    
        
       var filtros = undefined;
       
       // Só considera busca de filtro a partir de três caracteres    
       if($scope.filtro.busca.length > 0) filtros = {id: $scope.filtro.campo_busca.id, valor: $scope.filtro.busca + '%'};        
       // Filtro do grupo empresa => barra administrativa
       if($scope.usuariologado.grupoempresa){
            var filtroGrupoEmpresa = {id: $campos.administracao.webpagesusers.id_grupo, valor: $scope.usuariologado.grupoempresa.id_grupo};
            if(filtros) filtros = [filtros, filtroGrupoEmpresa];
            else filtros = filtroGrupoEmpresa;
       }
        
       $scope.obtendoPrivilegios = true;
       // TEMP
       //$scope.filtros = [{ RoleId: 1, RoleName: 'Admin'}];
       //$scope.obtendoPrivilegios = false;
       //$scope.hideProgress(divPortletBodyLogsPos);
       $webapi.get($apis.getUrl($apis.administracao.webpagesroles, [$scope.token, 0, $scope.filtro.campo_ordenacao.id, 
                                                       $scope.filtro.campo_ordenacao.order, 
                                                       $scope.filtro.itens_pagina, $scope.filtro.pagina],
                   filtros)) 
            .then(function(dados){
                $scope.filtros = dados.Registros;
                $scope.filtro.total_registros = dados.TotalDeRegistros;
                $scope.filtro.total_paginas = Math.ceil($scope.filtro.total_registros / $scope.filtro.itens_pagina);
                if($scope.filtros.length === 0) $scope.filtro.faixa_registros = '0-0';
                else{
                    var registroInicial = ($scope.filtro.pagina - 1)*$scope.filtro.itens_pagina + 1;
                    var registroFinal = registroInicial - 1 + $scope.filtro.itens_pagina;
                    if(registroFinal > $scope.filtro.total_registros) registroFinal = $scope.filtro.total_registros;
                    $scope.filtro.faixa_registros =  registroInicial + '-' + registroFinal;
                }
                $scope.obtendoPrivilegios = false;
                $scope.hideProgress(divPortletBodyLogsPos);
                // Verifica se a página atual é maior que o total de páginas
                if($scope.filtro.pagina > $scope.filtro.total_paginas)
                    setPagina(1); // volta para a primeira página e refaz a busca
              },
              function(failData){
                 $scope.obtendoPrivilegios = false;
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao requisitar privilégios (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyLogsPos);
              }); 
    };
        
                                                                                       
                                                
    // AÇÕES
    /**
      * Exibe cadastro novo privilégio
      */
    $scope.exibeCadastroNovoPrivilegio = function(exibe){
        $scope.cadastraNovoPrivilegio = exibe === undefined || exibe ? true : false;
        $scope.novoPrivilegio = '';
    }
    /**
      * Adiciona privilégio
      */
    $scope.addPrivilegio = function(){
        if(!$scope.novoPrivilegio){
           $scope.showAlert('Insira um nome!',true,'danger',true); 
           return;   
        }
        // Envia para o banco
        $scope.showProgress(divPortletBodyLogsPos);
        $webapi.post($apis.getUrl($apis.administracao.webpagesroles, undefined, 
                                  {id: 'token', valor: $scope.token}), {RoleName : $scope.novoPrivilegio})
                .then(function(dados){
                    $scope.showAlert('Privilégio cadastrado com sucesso!', true, 'success', true);
                    // Reseta o campo
                    $scope.novoPrivilegio = '';
                    $scope.hideProgress(divPortletBodyLogsPos);
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao cadastrar o privilégio (' + failData.status + ')', true, 'danger', true);
                     $scope.hideProgress(divPortletBodyLogsPos);
                  }); 
    }
    /**
      * Exibe as funcionalidades associadas ao privilégio
      */
    $scope.exibeFuncionalidades = function(filtro){
        // Reseta permissões
        $scope.permissoes = [];
        $scope.roleSelecionada = filtro;
        // Exibe o modal
        $('#modalFuncionalidades').modal('show');
        // Carrega as permissões
        obtemMódulosEFuncionalidades();
        
    }; 
    /**
      * Excluir privilégio
      */                                            
    var exluirPrivilegio = function(RoleId){
        // Deleta
        $scope.showProgress(divPortletBodyLogsPos);
        $webapi.delete($apis.getUrl($apis.administracao.webpagesroles, undefined,
                       [{id: 'token', valor: $scope.token},{id: 'RoleId', valor: RoleId}]))
            .then(function(dados){
                    $scope.showAlert('Privilégio excluído com sucesso!', true, 'success', true);
                    $scope.hideProgress(divPortletBodyLogsPos);
                    // atualiza tela de privilégios
                    $scope.buscaPrivilegios();
                  },function(failData){
                     if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                     else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                     else $scope.showAlert('Houve uma falha ao excluir o privilégio (' + failData.status + ')', true, 'danger', true);
                     $scope.hideProgress(divPortletBodyLogsPos);
                  }); 
    };
    /**
      * Solicitação confirmação para excluir o privilégio
      */                                                                              
    $scope.exluirPrivilegio = function(filtro){
        // Envia post para deletar
        $scope.showModalConfirmacao('Confirmação', 
                         'Tem certeza que deseja excluir ' + filtro.RoleName,
                         exluirPrivilegio, filtro.RoleId,
                         'Sim', 'Não');
    };    
                                                
                                                
    
    // CONTROLLERS E METHODS
    /**
      *  Marca/Desmarca todos métodos do controller
      */                                            
    var  selecionaMetodosDoController = function(controller){
        var check = controller.selecionado;
        if(controller.methods) 
            // Marca/Desmarca todos os métodos
            for(var k = 0; k < controller.methods.length; k++) controller.methods[k].selecionado = check;   
    }
    /**
      *  Marca/Desmarca todos a partir do controller
      */
    var selecionaController = function(controller){
        var check = controller.selecionado;
        // Tem métodos?
        selecionaMetodosDoController(controller);
        // Tem sub controllers?
        if(!check && controller.subcontrollers){
            // Marca cada subcontroller, seus métodos e todos os seus filhos
            for(var k = 0; k < controller.subcontrollers.length; k++){
                var sub = controller.subcontrollers[k];
                sub.selecionado = check;
                selecionaController(sub); // recursivo
            }
        }
    };
    /**
      *
      */
    $scope.handleCheckController = function(controller){
        if(!controller) return;
        //console.log(angular.equals($scope.originalControllers, $scope.controllers));
        if(angular.isArray(controller)){
            // é um controller filho
            var ctrlFilho = controller[0];
            var check = ctrlFilho.selecionado;
            selecionaController(ctrlFilho);
            // Se ele acabou de ser marcado => marca os pais
            if(check){
               for(var k = 1; k < controller.length; k++){ 
                   var ctrl = controller[k];
                   ctrl.selecionado = true;
                   // Seleciona todos os métodos do controller
                   selecionaMetodosDoController(ctrl);
               }
            }
        }else{
            // Marca do controller para baixo
            selecionaController(controller);
        }
    }
    $scope.handleCheckMethod = function(method, controller){
        if(!method.selecionado){
            // Verifica se ainda tem algum método selecionado
            if($filter('filter')(controller.methods, function(m){return m.selecionado === true;}).length == 0){
                // Não tem mais métodos selecionados => Desmarca o controller
                controller.selecionado = false;
                selecionaController(controller);
            }
        }
    }
    /**
      * Carrega todos os módulos e respectivas funcionalidades
      */
    var obtemMódulosEFuncionalidades = function(){
       //$scope.obtendoModulosEFuncionalidades = true;
       $scope.showProgress();
       $webapi.get($apis.getUrl($apis.administracao.webpagescontrollers, 
                                [$scope.token, 2, $campos.administracao.webpagescontrollers.ds_controller], 
                   {id : $campos.administracao.webpagescontrollers.RoleId, valor: $scope.roleSelecionada.RoleId})) 
            .then(function(dados){
                $scope.controllers = dados.Registros;
                // set selecionado dos controllers
                determinaControllersSelecionados($scope.controllers);
                // Faz uma cópia (por valor) do controller proveniente da base de dados
                angular.copy($scope.controllers, $scope.originalControllers);
                //$scope.obtendoModulosEFuncionalidades = false;
                $scope.hideProgress(divPortletBodyLogsPos);
              },
              function(failData){
                 //$scope.obtendoModulosEFuncionalidades = false;
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao requisitar módulos e funcionalidades (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress();
              }); 
    };
    /**
      * Do conjunto de controllers, seleciona os elementos que tem métodos permitidos
      */
    var determinaControllersSelecionados = function(controllers){
        if(!controllers || controllers.length == 0) return;
        for(var k = 0; k < controllers.length; k++){
            var controller = controllers[k];
            // Indica se ele está marcado
            controller.selecionado = $filter('filter')(controller.methods, function(m){return m.selecionado === true;}).length > 0;
            // Faz isso com os filhos
            if(controller.subControllers) determinaControllersSelecionados(controller.subControllers);
        }
    };
    /**
      * Retoma as permissões que estão salvas na base de dados
      */
    $scope.resetaPermissoes = function(){
        angular.copy($scope.originalControllers, $scope.controllers);    
    };
    /**
      * Salva as permissões
      */
    $scope.salvaPermissoes = function(){
        // Guarda as permissões
        var permissoes = [];
        // Armazena somente as que tiveram alterações
        obtemPermissoesModificadas($scope.controllers, $scope.originalControllers, permissoes);
        
        // Verifica se tiveram alterações
        if(permissoes.length == 0) console.log("NÃO HOUVE ALTERAÇÕES");
        else console.log(permissoes);
    }; 
    /**
      * Comparando cada método dos controllers novo e original, armazena no array permissoes somente as que foram modificadas
      */
    var obtemPermissoesModificadas = function(newControllers, originalControllers, permissoes){
        for(var k = 0; k < newControllers.length; k++){
            var novo = newControllers[k];
            var original = originalControllers[k];
            armazenaPermissoesModificadas(novo, original, permissoes);
            // Percorre os filhos
            if(novo.subcontrollers) obtemPermissoesModificadas(novo.subcontrollers, original.subcontrollers, permissoes);
        }    
    };
    /**
      * Armazena no array permissoes somente os métodos que foram modificados quanto à seleção
      */                                            
    var armazenaPermissoesModificadas = function(newController, originalController, permissoes){
        for(var k = 0; k < newController.methods.length; k++){
            var novo = newController.methods[k];    
            var original = originalController.methods[k];
            // Evitar erros
            if(novo.selecionado === undefined) novo.selecionado = false;
            if(original.selecionado === undefined) original.selecionado = false;
            // Compara
            if(novo.selecionado !== original.selecionado){
                console.log("DIFERENTES!");
                var json = {id_roles : $scope.roleSelecionada.RoleId,
                            id_method : novo.id_method,
                            fl_principal : novo.home
                           };
                if(!novo.selecionado){
                    // Remove par!
                    json.remover = true; // DEFINIR SE VAI SER ISSO MESMO
                }
                // Coloca no array
                permissoes.push(json);
            }
        }
    };

}])